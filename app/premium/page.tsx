import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PremiumPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Premium Features</h1>
        <p className="text-lg text-white/90">
          Unlock advanced features and early access to predictions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Premium features will include:</p>
          <ul className="space-y-2 list-none">
            <li className="flex items-center gap-2">
              <span className="text-xl">🔓</span>
              <span>Early unlock of locked predictions</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <span>Advanced analytics and insights</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span>Priority expert access</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <span>Real-time notifications</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}



