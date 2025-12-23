"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export function AutoLogout() {
    const router = useRouter()
    // 30 minutes in milliseconds
    const INACTIVITY_LIMIT = 30 * 60 * 1000
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Function to handle logout
        const handleLogout = async () => {
            console.log("Auto-logout due to inactivity")
            await supabase.auth.signOut()
            router.push("/login")
        }

        // Reset timer on user activity
        const resetTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
            timerRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT)
        }

        // List of events to track
        const events = [
            "mousedown",
            "mousemove",
            "keydown",
            "scroll",
            "touchstart",
            "click"
        ]

        // Initialize timer
        resetTimer()

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer)
        })

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer)
            })
        }
    }, [router, INACTIVITY_LIMIT])

    return null // This component doesn't render anything visible
}
