import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/50 backdrop-blur">
      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/branding/verivo-logo-light.png"
                alt="Verivo"
                width={180}
                height={55}
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-gray-600 mb-1">Verified Expert Predictions Platform</p>
            <p className="text-xs italic text-gray-500">Where Insights Are Verified.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-600 hover:text-purple-600">Home</Link></li>
              <li><Link href="/predictions" className="text-gray-600 hover:text-purple-600">Forecasts</Link></li>
              <li><Link href="/feed" className="text-gray-600 hover:text-purple-600">Feed</Link></li>
              <li><Link href="/experts" className="text-gray-600 hover:text-purple-600">Experts</Link></li>
              <li><Link href="/leaderboard" className="text-gray-600 hover:text-purple-600">Leaderboard</Link></li>
              <li><Link href="/premium" className="text-gray-600 hover:text-purple-600">Premium</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-600 hover:text-purple-600">About Us</Link></li>
              <li><Link href="/how-it-works" className="text-gray-600 hover:text-purple-600">How It Works</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-purple-600">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-gray-600 hover:text-purple-600">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-purple-600">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-2">
              <a href="#" className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-purple-100 text-gray-600 hover:text-purple-600">Twitter</a>
              <a href="#" className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-purple-100 text-gray-600 hover:text-purple-600">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 max-w-3xl mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> Verivo provides informational predictions only. Not financial, investment, or betting advice. No guarantees of accuracy. Use at your own risk.
            </p>
          </div>
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Verivo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}



