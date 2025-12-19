"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/predictions', label: 'Predictions' },
    { href: '/feed', label: 'Feed' },
    { href: '/experts', label: 'Experts' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/premium', label: 'Premium' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-purple-600">Verivo</span>
            <span className="text-xs text-gray-500 -mt-1">Trust the data, not the hype.</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-purple-600 ${pathname === link.href ? 'text-purple-600' : 'text-gray-700'
                }`}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <span className="text-sm text-gray-600">Welcome, {user.email?.split('@')[0]}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link href="/onboarding">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}



