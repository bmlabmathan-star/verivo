import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HowItWorksPage() {
    const steps = [
        {
            title: "1. Creation",
            description: "A contributor defines a specific, measurable commitment. This includes the subject, the forecast outcome, and the precise timestamp for the reveal.",
            icon: "✍️",
            color: "border-blue-500/30"
        },
        {
            title: "2. Time-Locking",
            description: "Once submitted, the prediction is cryptographically secured. It becomes unalterable and immutable, preventing any retrospective edits or deletions.",
            icon: "🔒",
            color: "border-purple-500/30"
        },
        {
            title: "3. Reveal",
            description: "Upon reaching the specified maturity date, the prediction is automatically revealed. The original commitment is then made visible for public verification.",
            icon: "👁️",
            color: "border-cyan-500/30"
        },
        {
            title: "4. Credibility Tracking",
            description: "The outcome is compared against the prediction. The contributor's public credibility score and track record are updated based on the accuracy of the commitment.",
            icon: "📈",
            color: "border-green-500/30"
        }
    ]

    return (
        <div className="container py-12 max-w-5xl">
            <div className="mb-16 text-center">
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-top-10 duration-700">
                    HOW IT WORKS
                </h1>
                <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
                    The Verivo protocol ensures that every commitment is secured by design. Follow the lifecycle of a time-locked prediction from initialization to accountability.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {steps.map((step, index) => (
                    <Card key={index} className={`glass-card border-white/10 ${step.color} overflow-hidden card-hover transition-all duration-300`}>
                        <CardHeader className="flex flex-row items-center space-x-4 pt-8">
                            <div className="text-4xl bg-white/5 w-16 h-16 flex items-center justify-center rounded-2xl border border-white/10">
                                {step.icon}
                            </div>
                            <CardTitle className="text-white text-2xl">{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-8">
                            <p className="text-white/70 leading-relaxed text-lg">
                                {step.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="glass-card p-10 rounded-3xl border border-white/5 bg-white/5 text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Built for Transparency</h2>
                <p className="text-white/60 max-w-3xl mx-auto leading-relaxed text-lg">
                    By utilizing the time-locking protocol, Verivo eliminates the "survivorship bias" often seen in public forecasts. Only those who are willing to lock their commitments can build a truly verifiable reputation.
                </p>
            </div>
        </div>
    )
}
