import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AutoLogout } from "@/components/auto-logout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Verivo - Prediction Credibility Platform",
  description: "Verified Expert Predictions Platform. Where Insights Are Verified.",
  icons: {
    icon: "/branding/verivo-logo-light.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AutoLogout />
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
