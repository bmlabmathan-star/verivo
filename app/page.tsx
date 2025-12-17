import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
          Welcome to Verivo
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-4">
          Verified Expert Predictions Platform
        </p>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          Connect with verified experts who provide locked predictions on equity, commodity, currency, and crypto markets.
          All predictions are validated after events close, helping you identify real experts.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/register">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Make Predictions
            </Button>
          </Link>
          <Link href="/feed">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Follow Predictions
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
        <Card className="card-hover">
          <CardHeader>
            <div className="text-4xl mb-4">🔒</div>
            <CardTitle>Locked Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Expert predictions are locked before events and revealed only after validation
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <div className="text-4xl mb-4">✅</div>
            <CardTitle>Verified Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All predictions are validated against actual market outcomes
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <div className="text-4xl mb-4">⭐</div>
            <CardTitle>Expert Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Experts are rated based on their prediction accuracy and performance
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <div className="text-4xl mb-4">📈</div>
            <CardTitle>Multiple Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coverage across equity, commodity, currency, and cryptocurrency markets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="max-w-4xl mx-auto mb-16">
        <CardHeader>
          <CardTitle className="text-3xl text-center">How Verivo Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: "1", title: "Expert Registration", desc: "Experts register and create their profile" },
              { num: "2", title: "Submit Predictions", desc: "Experts submit predictions which are immediately locked" },
              { num: "3", title: "Event Closure", desc: "After the event closes, actual results are recorded" },
              { num: "4", title: "Validation & Rating", desc: "Predictions are validated and expert ratings are updated" },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Explanation Section */}
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Understanding Verivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg border">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-semibold text-lg mb-2">What Locking Means</h3>
              <p className="text-sm text-muted-foreground">
                When an expert makes a prediction, it&apos;s immediately locked and cannot be changed. This ensures transparency and prevents experts from editing their predictions after seeing market movements.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg border">
              <div className="text-4xl mb-4">🔓</div>
              <h3 className="font-semibold text-lg mb-2">What Reveal Means</h3>
              <p className="text-sm text-muted-foreground">
                After the event closes, predictions are revealed and validated against actual market outcomes. This process is transparent and automated, ensuring that expert performance is accurately tracked.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg border">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold text-lg mb-2">Why Accuracy Matters</h3>
              <p className="text-sm text-muted-foreground">
                Accuracy is the foundation of trust. Verivo tracks every prediction and calculates expert accuracy rates. This helps you identify truly skilled experts who consistently make correct predictions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



