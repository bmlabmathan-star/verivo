"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { VerivoLogo, VerivoIcon } from "@/components/verivo-logo"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

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
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      // Fallback redirection
      window.location.href = '/login'
    }
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/predictions', label: 'Forecasts' },
    { href: '/feed', label: 'Feed' },
    { href: '/experts', label: 'Experts' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/premium', label: 'Premium' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <VerivoIcon className="w-8 h-8" color="#7C3AED" />
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-white leading-none">
              Verivo
            </span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase mt-0.5">
              Where Insights Are Verified.
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-purple-400 ${pathname === link.href ? 'text-purple-400' : 'text-gray-300'
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
              <span className="text-sm text-gray-400">Welcome, {user.email?.split('@')[0]}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}



