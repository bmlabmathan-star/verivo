import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
    const sections = [
        {
            title: "1. Nature of the Platform",
            content: "Verivo is an informational platform provided for record-keeping and transparency purposes. The content, including predictions and track records, is for informational use only."
        },
        {
            title: "2. No Advice",
            content: "Nothing on this platform constitutes financial, legal, investment, or professional advice. All data and predictions are provided without regard to any individual's specific objectives or situation."
        },
        {
            title: "3. No Guarantees",
            content: "Verivo does not guarantee the accuracy, completeness, or reliability of any information provided by contributors. Past performance or track records are not indicative of future results."
        },
        {
            title: "4. User Responsibility",
            content: "Users are solely responsible for any decisions made based on the information found on Verivo. We recommend consulting with qualified professionals before making any significant decisions."
        },
        {
            title: "5. Limitation of Liability",
            content: "Verivo and its founders are not liable for any losses or damages arising from the use of the platform or reliance on its content."
        }
    ]

    return (
        <div className="container py-12 max-w-5xl">
            <div className="mb-16 text-center">
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-top-10 duration-700">
                    TERMS OF SERVICE
                </h1>
                <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
                    Please read these terms carefully. By using Verivo, you agree to the neutral and informational nature of our platform.
                </p>
            </div>

            <div className="space-y-8 mb-16">
                {sections.map((section, index) => (
                    <Card key={index} className="glass-card border-white/10 overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5">
                            <CardTitle className="text-white text-xl">{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-white/70 leading-relaxed text-lg">
                                {section.content}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="text-center p-12 glass-card rounded-3xl border border-white/5 bg-white/5">
                <p className="text-white/40 text-sm">
                    Last updated: December 19, 2025
                </p>
            </div>
        </div>
    )
}
