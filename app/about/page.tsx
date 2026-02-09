import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Scale, Eye, Lock } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="container py-16 max-w-5xl">
            {/* Hero Section */}
            <div className="mb-20 text-center">
                <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-top-10 duration-700">
                    ABOUT VERIVO
                </h1>
                <p className="text-xl md:text-2xl text-white/80 font-medium max-w-3xl mx-auto leading-relaxed">
                    The institutional standard for verifiable performance. Verivo provides the immutable infrastructure to transform transient insights into permanent, auditable assets of professional credibility.
                </p>
            </div>

            {/* Platform Purpose - Company Identity Removed */}
            <div className="mb-16">
                <div className="glass-card p-10 rounded-3xl border border-white/10 flex flex-col justify-center text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Platform Purpose</h2>
                    <p className="text-white/70 leading-relaxed text-lg max-w-4xl mx-auto">
                        Verivo exists to bridge the trust gap in the information age. We are not a prediction market or a trading platform. We are a neutral validation layer—a "Notary Public" for digital foresight—providing the rigorous framework necessary for experts to prove their accuracy without ambiguity.
                    </p>
                </div>
            </div>

            {/* Vision & Mission */}
            <div className="mb-20">
                <h2 className="text-3xl font-bold text-white mb-10 text-center">Our Mandate</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glass-card border-white/10 overflow-hidden bg-white/5">
                        <CardHeader>
                            <CardTitle className="text-white text-2xl flex items-center gap-3">
                                <Eye className="h-6 w-6 text-cyan-400" />
                                Vision
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-white/70 leading-relaxed text-lg">
                                To establish the global benchmark for truth-in-performance, creating a meritocratic ecosystem where reputation is derived solely from proven, unalterable outcomes rather than claims.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10 overflow-hidden bg-white/5">
                        <CardHeader>
                            <CardTitle className="text-white text-2xl flex items-center gap-3">
                                <ShieldCheck className="h-6 w-6 text-green-400" />
                                Mission
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-white/70 leading-relaxed text-lg">
                                To empower professionals and institutions with a trustless record of their foresight, delivering transparency to the public and accountability to the industry through immutable data verification.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Core Principles */}
            <div className="mb-20">
                <h2 className="text-3xl font-bold text-white mb-10 text-center">Core Principles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors">
                        <Scale className="h-10 w-10 text-purple-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-3">Neutrality</h3>
                        <p className="text-white/60">
                            We do not offer opinions, analysis, or advice. Verivo is the impartial arbiter that strictly validates whether a predicted outcome occurred.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-colors">
                        <Lock className="h-10 w-10 text-cyan-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-3">Immutability</h3>
                        <p className="text-white/60">
                            History cannot be rewritten. Once a forecast is locked on Verivo, it becomes a permanent part of the expert's record, ensuring absolute integrity.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors">
                        <Eye className="h-10 w-10 text-green-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-3">Transparency</h3>
                        <p className="text-white/60">
                            We believe that sunlight is the best disinfectant. All validation criteria, timestamps, and outcome determinations are open for audit.
                        </p>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-20 pt-10 border-t border-white/10 text-center">
                <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Important Disclaimer</h4>
                <p className="text-white/30 text-sm max-w-3xl mx-auto leading-relaxed">
                    Verivo Limited is a platform for data validation and reputation tracking. We do not provide financial, investment, legal, or tax advice. Verivo does not handle user funds, manage assets, or facilitate the trading of securities or derivatives. All content on this platform is for informational and record-keeping purposes only. Past performance verified on Verivo is a record of history, not a guarantee of future results.
                </p>
            </div>
        </div>
    )
}
