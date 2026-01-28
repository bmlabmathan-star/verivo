"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { toggleFollow } from "@/lib/actions/follow"
import { UserPlus, UserCheck, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
    expertId: string
    initialIsFollowing: boolean
    isOwnProfile?: boolean
}

export function FollowButton({ expertId, initialIsFollowing, isOwnProfile = false }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleToggle = async () => {
        if (isOwnProfile) return
        // Optimistic update
        const previousState = isFollowing
        setIsFollowing(!previousState)

        try {
            await toggleFollow(expertId)
            router.refresh() // Refresh to update counts
        } catch (error) {
            // Revert on error
            setIsFollowing(previousState)
            console.error(error)
        }
    }

    return (
        <Button
            onClick={handleToggle}
            disabled={isPending}
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            className={`
        transition-all duration-200 gap-2 min-w-[120px]
        ${isFollowing
                    ? "bg-transparent border-purple-500/50 text-purple-200 hover:bg-purple-900/20 hover:text-white"
                    : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"}
      `}
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserCheck className="w-4 h-4" />
                    Following
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                </>
            )}
        </Button>
    )
}
