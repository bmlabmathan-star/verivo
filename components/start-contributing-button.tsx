"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useState } from "react"

export function StartContributingButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push("/predictions/create")
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Auth check failed", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={isLoading}
      className="bg-white text-purple-700 hover:bg-white/90 hover:scale-105 transition-all duration-300 font-bold px-10 py-8 text-xl rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)]"
    >
      {isLoading ? "Checking..." : "Start Contributing"}
    </Button>
  )
}
