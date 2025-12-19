import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
    return (
        <div className="container py-12 max-w-5xl">
            <div className="mb-16 text-center">
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-top-10 duration-700">
                    ABOUT VERIVO
                </h1>
                <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
                    Verivo is a neutral infrastructure for record-based accountability. We provide the framework for time-locked commitments, ensuring a transparent and unalterable history of performance across all domains.
                </p>
            </div>

            <div className="glass-card p-10 rounded-3xl mb-16 border-l-8 border-purple-500">
                <h2 className="text-2xl font-bold text-white mb-4">Philosophy</h2>
                <p className="text-white/70 leading-relaxed text-lg">
                    The platform was initiated to address the growing need for verifiable credibility in an era of asymmetric information. Verivo's architecture is built on a transparency-first philosophy, where evidence outweighs assertions and records define reputation.
                </p>
            </div>

            <div className="mb-16">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">The Founders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="glass-card border-white/10 overflow-hidden">
                        <CardHeader className="bg-white/5">
                            <CardTitle className="text-white text-2xl">Mathan Babu Baskar</CardTitle>
                            <p className="text-purple-400 font-bold text-sm uppercase tracking-widest">CEO</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-white/70 leading-relaxed">
                                A serial entrepreneur who initiated the Verivo platform. His focus is on shaping the platform's vision and ensuring its commitment to transparency-first data integrity. As CEO, he oversees the strategic direction and the foundational implementation of the credibility protocol.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10 overflow-hidden">
                        <CardHeader className="bg-white/5">
                            <CardTitle className="text-white text-2xl">Rekha</CardTitle>
                            <p className="text-cyan-400 font-bold text-sm uppercase tracking-widest">Operations & Product Development</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-white/70 leading-relaxed">
                                A software engineer (2011 graduate) responsible for Verivo's operations and product evolution. Her technical background informs the platform's development, focusing on building robust systems that support the core mission of verifiable records and accountability.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="text-center p-12 glass-card rounded-3xl border border-white/5 bg-white/5">
                <h3 className="text-2xl font-bold text-white mb-4">Focus on Credibility</h3>
                <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
                    Verivo remains committed to providing a neutral ground for experts and enthusiasts alike. By removing the possibility of retrospective edits, we ensure that every prediction serves as a permanent mark of an individual's analytical accuracy.
                </p>
            </div>
        </div>
    )
}
