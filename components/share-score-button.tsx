"use client"

import { useState } from "react"
import { Share2, X, Copy, Check, Link } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareScoreButtonProps {
    stats: {
        verivoScore: string
        accuracy: string
        totalPredictions: number
        confidenceFactor: number
    }
    profileUrl: string
}

export function ShareScoreButton({ stats, profileUrl }: ShareScoreButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const title = "My Verivo Trading Credibility Score"
    const body = `Verivo Score: ${stats.verivoScore}
Credible Accuracy: ${stats.accuracy}
Predictions Evaluated: ${stats.totalPredictions}
Confidence Factor: ${stats.confidenceFactor}

Where Insights Are Verified.`

    const fullShareText = `${title}\n\n${body}`

    const handleShare = async () => {
        const shareData = {
            title,
            text: body, // Some browsers append URL automatically, some don't.
            url: profileUrl,
        }

        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share(shareData)
                return
            } catch (err) {
                // user cancelled or failed
                // check if AbortError, if so ignore, else show manual
            }
        }
        setIsOpen(true)
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(`${fullShareText}\n${profileUrl}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Social Links
    const encodedText = encodeURIComponent(fullShareText)
    const encodedUrl = encodeURIComponent(profileUrl)

    const socialLinks = [
        {
            name: "WhatsApp",
            url: `https://wa.me/?text=${encodeURIComponent(`${fullShareText} ${profileUrl}`)}`,
            color: "bg-[#25D366] hover:bg-[#25D366]/90",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
            )
        },
        {
            name: "X / Twitter",
            url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            color: "bg-black hover:bg-black/80 border border-white/20",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            )
        },
        {
            name: "LinkedIn",
            url: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}%20${encodedUrl}`,
            // LinkedIn share url with text parameter works better for feed posts than just url sharing
            color: "bg-[#0A66C2] hover:bg-[#0A66C2]/90",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            )
        },
        {
            name: "Facebook",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
            color: "bg-[#1877F2] hover:bg-[#1877F2]/90",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.594v.376h3.636l-.566 3.667h-3.07v7.98c2.768-.696 4.956-2.923 5.488-5.696.02-.103.041-.205.056-.309.117-.822.117-1.636 0-2.458a8.68 8.68 0 0 0-.056-.309 8.783 8.783 0 0 0-.74-2.583 8.624 8.624 0 0 0-1.2-1.928 8.736 8.736 0 0 0-4.004-2.822A8.78 8.78 0 0 0 12 2.01a8.761 8.761 0 0 0-2.225.293 8.733 8.733 0 0 0-4.819 3.593 8.736 8.736 0 0 0-1.201 1.928 8.601 8.601 0 0 0-.74 2.583c-.012.08-.024.162-.033.243A8.455 8.455 0 0 0 3.01 12a8.652 8.652 0 0 0 .11 1.365c.012.081.025.161.033.242.06.495.163.978.307 1.442a8.665 8.665 0 0 0 5.641 8.642z" />
                </svg>
            )
        },
        {
            name: "Telegram",
            url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
            color: "bg-[#26A5E4] hover:bg-[#26A5E4]/90",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
            )
        }
    ]

    return (
        <>
            <Button
                onClick={handleShare}
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10"
                title="Share your verified Verivo credibility score"
            >
                <Share2 className="w-5 h-5" />
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-[#0F172A] border border-white/10 p-6 rounded-2xl max-w-sm w-full space-y-6 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Share Performance</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="bg-white/5 rounded-lg p-4 text-xs text-gray-300 font-mono leading-relaxed border border-white/5 relative group">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                </Button>
                            </div>
                            <p className="font-bold text-white mb-2">{title}</p>
                            <p className="whitespace-pre-wrap">{body}</p>
                            <p className="mt-2 text-blue-400 truncate">{profileUrl}</p>
                        </div>

                        {/* Actions Grid */}
                        <div className="grid grid-cols-4 gap-3">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex flex-col items-center gap-2 group`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className={`${link.color} w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110 shadow-lg`}>
                                        {link.icon}
                                    </div>
                                    <span className="text-[10px] text-gray-400 group-hover:text-white transition-colors">{link.name}</span>
                                </a>
                            ))}
                        </div>

                        {/* Copy Link fallback */}
                        <button
                            onClick={handleCopy}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm text-gray-300 font-medium"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied to Clipboard" : "Copy Text & Link"}
                        </button>
                    </div>

                    {/* Dismiss overlay click */}
                    <div className="absolute inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
                </div>
            )}
        </>
    )
}
