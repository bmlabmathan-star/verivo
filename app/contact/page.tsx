import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
    return (
        <div className="container py-12 max-w-5xl">
            <div className="mb-16 text-center">
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-top-10 duration-700">
                    CONTACT US
                </h1>
                <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
                    We value your input. Whether you have questions about the protocol or suggestions for the platform, our team is ready to listen.
                </p>
            </div>

            <div className="max-w-2xl mx-auto">
                <Card className="glass-card border-white/10 overflow-hidden text-center p-12">
                    <CardHeader>
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 border border-purple-500/30 text-4xl mb-6 mx-auto">
                            ✉️
                        </div>
                        <CardTitle className="text-white text-3xl mb-4">Get in Touch</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-white/70 text-lg mb-8 leading-relaxed">
                            For general inquiries, feedback, or technical support, please reach out via email. We aim to respond to all professional inquiries within 48 hours.
                        </p>
                        <a
                            href="mailto:info@verivo.com"
                            className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20"
                        >
                            info@verivo.com
                        </a>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-16 text-center text-white/40 text-sm italic">
                "Transparency is not a feature; it is our foundation."
            </div>
        </div>
    )
}
