import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
    const sections = [
        {
            title: "1. Data Collection",
            content: "As an early-stage platform, Verivo collects minimal data necessary to function. This includes account credentials (if applicable), essential profile information, and the prediction data you choose to submit to the temporal protocol."
        },
        {
            title: "2. How Data is Used",
            content: "Collected data is used to provide the time-locking and reveal services, maintain your public track record, and improve the platform's functionality. We may also use your contact information for essential service-related communications."
        },
        {
            title: "3. Privacy and Transparency",
            content: "Due to the nature of Verivo, prediction data is designed to be eventually public. However, we respect your personal privacy. We do not sell or share your personal identification information with third-party advertisers."
        },
        {
            title: "4. Data Security",
            content: "We implement standard security measures to protect your data from unauthorized access or disclosure. As we evolve, we continue to enhance these protections to meet industry standards."
        },
        {
            title: "5. Your Rights",
            content: "Users may request to view or update their profile information. Given the unalterable nature of the time-locked protocol, prediction data cannot be deleted once it has been secured."
        }
    ]

    return (
        <div className="container py-12 max-w-5xl">
            <div className="mb-16 text-center">
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-top-10 duration-700">
                    PRIVACY POLICY
                </h1>
                <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
                    Verivo is committed to protecting your privacy while ensuring the integrity of the temporal record. Our policy is designed to be simple and transparent.
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
