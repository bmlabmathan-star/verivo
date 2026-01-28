"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function toggleFollow(expertId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    if (user.id === expertId) {
        throw new Error("Cannot follow yourself")
    }

    // Check if already following
    const { data: existingFollow } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("expert_id", expertId)
        .single()

    if (existingFollow) {
        // Unfollow
        const { error } = await supabase
            .from("follows")
            .delete()
            .eq("id", existingFollow.id)

        if (error) {
            console.error("Error unfollowing:", error)
            throw new Error("Failed to unfollow")
        }
    } else {
        // Follow
        const { error } = await supabase
            .from("follows")
            .insert({
                follower_id: user.id,
                expert_id: expertId
            })

        if (error) {
            console.error("Error following:", error)
            throw new Error("Failed to follow")
        }
    }

    revalidatePath(`/experts/${expertId}`)
    revalidatePath("/dashboard")
    return !existingFollow
}

export async function getFollowStatus(expertId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("expert_id", expertId)
        .single()

    return !!data
}

export async function getFollowerCount(expertId: string) {
    const supabase = await createClient()

    const { count, error } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("expert_id", expertId)

    if (error) {
        console.error("Error getting follower count:", error)
        return 0
    }

    return count || 0
}

export async function getFollowingList() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from("follows")
        .select(`
      expert_id,
      created_at,
      experts:expert_id (
        id,
        name,
        username,
        expert_stats (
          verivo_score
        )
      )
    `)
        .eq("follower_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching following list:", error)
        return []
    }

    // Transform data to a cleaner format
    return data.map((item: any) => ({
        expertId: item.expert_id,
        name: item.experts?.name || "Unknown Expert",
        username: item.experts?.username || "",
        verivoScore: item.experts?.expert_stats?.[0]?.verivo_score || null,
        followedAt: item.created_at
    }))
}
