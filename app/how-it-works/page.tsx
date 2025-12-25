import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HowItWorksPage() {
    const steps = [
        {
            title: "1. Smart Prediction",
            description: "You don't just guess; you commit. Every prediction includes a specific asset, a direction, and a fixed timeframe.",
            icon: "🧠",
            color: "border-blue-500/30"
        },
        {
            title: "2. Time-Locking",
            description: "Once submitted, your prediction is locked. It cannot be edited, deleted, or hidden. This eliminates 'hindsight bias' and ensures total honesty.",
            icon: "🔒",
            color: "border-purple-500/30"
        },
        {
            title: "3. Auto-Validation",
            description: "When the timeframe ends, Verivo automatically fetches the real market data to verify if you were Right or Wrong. No human interference.",
            icon: "⚡",
            color: "border-cyan-500/30"
        },
        {
            title: "4. Credibility Scoring",
            description: "Your Verivo Score updates instantly. Difficult predictions (long timeframe) boost your score significantly; easy ones barely move the needle.",
            icon: "📈",
            color: "border-green-500/30"
        }
    ]

    return (
        <div className="container py-16 max-w-5xl">
            {/* Hero Section */}
            <div className="mb-20 text-center space-y-6">
                <Badge variant="outline" className="px-4 py-1 text-sm border-purple-500/50 text-purple-200 mb-4 bg-purple-500/10 backdrop-blur-sm uppercase tracking-wide">
                    The Trust Engine
                </Badge>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                    HOW IT <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">WORKS</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/80 font-medium max-w-3xl mx-auto leading-relaxed">
                    Verivo applies a difficulty-weighted algorithm to measure real human foresight.
                </p>
            </div>

            {/* Core Philosophy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-white leading-tight">
                        We don’t just measure if you’re right.<br />
                        <span className="text-purple-400">We measure how hard it was.</span>
                    </h2>
                    <p className="text-lg text-white/70 leading-relaxed">
                        Anyone can get lucky once. But Verivo tracks who is right <strong>consistently</strong>, especially when predictions are difficult.
                    </p>
                    <p className="text-lg text-white/70 leading-relaxed">
                        A 5-minute prediction is easy and gets very little weight. A 3-hour prediction is significantly harder and earns you much more credibility.
                    </p>
                    <div className="p-4 bg-white/5 border-l-4 border-purple-500 rounded-r-lg">
                        <p className="text-white/90 italic font-medium">
                            “Verivo doesn’t reward being loud — it rewards being right, consistently, over time.”
                        </p>
                    </div>
                </div>
                <div className="relative">
                    {/* Visual representation of the algorithm */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-blue-600/20 rounded-3xl blur-2xl"></div>
                    <div className="relative glass-card p-8 rounded-3xl border border-white/10 bg-black/40 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <span className="text-white/60">5 Minute Forecast</span>
                            <Badge variant="secondary" className="bg-gray-700/50">Low Weight (0.1x)</Badge>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <span className="text-white/60">30 Minute Forecast</span>
                            <Badge variant="secondary" className="bg-blue-900/40 text-blue-200">Medium Weight (0.5x)</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white font-semibold">3 Hour Forecast</span>
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-none">High Weight (1.0x)</Badge>
                        </div>

                        <div className="pt-4 text-center">
                            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Resulting Metric</p>
                            <div className="text-3xl font-black text-white">VERIVO SCORE</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
                {steps.map((step, index) => (
                    <Card key={index} className={`glass-card border-white/5 bg-white/5 ${step.color} hover:bg-white/10 transition-all duration-300`}>
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="text-3xl bg-black/30 w-12 h-12 flex items-center justify-center rounded-xl border border-white/10">
                                {step.icon}
                            </div>
                            <CardTitle className="text-xl text-white font-bold">{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-white/60 leading-relaxed">
                                {step.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* The 3 Pillars */}
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-white mb-10">The Pillars of Credibility</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors">
                        <div className="text-4xl mb-4">🎯</div>
                        <h3 className="text-xl font-bold text-white mb-2">Accuracy</h3>
                        <p className="text-white/60 text-sm">Do your predictions actually come true? We verify every single one against real-world data.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors">
                        <div className="text-4xl mb-4">⏳</div>
                        <h3 className="text-xl font-bold text-white mb-2">Time Horizon</h3>
                        <p className="text-white/60 text-sm">How far ahead can you see? Longer predictions reveal deeper insight and earn higher scores.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors">
                        <div className="text-4xl mb-4">🔁</div>
                        <h3 className="text-xl font-bold text-white mb-2">Consistency</h3>
                        <p className="text-white/60 text-sm">Can you repeat your success? The Verivo Score rewards sustained performance over luck.</p>
                    </div>
                </div>
            </div>

            {/* Trust Protocol Footer */}
            <div className="glass-card p-12 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-900/10 to-black text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    "We’re not predicting markets.<br />
                    We’re predicting who is worth trusting."
                </h2>
                <p className="text-white/50 max-w-2xl mx-auto text-lg mb-8">
                    Verivo is the credibility protocol for human judgment.
                </p>
            </div>
        </div>
    )
}
