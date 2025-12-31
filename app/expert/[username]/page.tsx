
import Link from "next/link"
import { notFound } from "next/navigation"
import { getExpertByUsername } from "@/lib/actions/experts"
import { getExpertPerformance } from "@/lib/actions/profile"
import { ProfilePerformanceTabs } from "@/components/profile-performance-tabs"
import { DownloadReportButton } from "@/components/download-report-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PredictionCard } from "@/components/prediction-card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Share2, Copy, ExternalLink, Calendar, MapPin } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = await params
    return {
        title: `Verivo Expert | @${resolvedParams.username}`,
        description: `Verified performance profile for ${resolvedParams.username} on Verivo.`,
    }
}

export default async function ExpertPublicProfilePage({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    const resolvedParams = await params
    const { username } = resolvedParams

    // Fetch Expert Data using existing action
    const expert = await getExpertByUsername(username)

    if (!expert) {
        notFound()
    }

    // Fetch Performance Data including raw predictions for tabs
    const performance = await getExpertPerformance(expert.id)

    // Extract Stats
    // Handle if expert_stats is array or object due to Supabase join
    const rawStats = Array.isArray(expert.expert_stats) ? expert.expert_stats[0] : expert.expert_stats
    const stats = rawStats || {
        total_predictions: 0,
        correct_predictions: 0,
        accuracy_rate: 0,
        verivo_score: 0
    }

    const displayName = expert.name || expert.username || `Contributor #${expert.id.slice(0, 4)}`

    return (
        <div className="min-h-screen bg-[#020617] text-white py-12">
            <div className="container max-w-5xl mx-auto px-4">

                {/* 1. Hero Section */}
                <div className="relative mb-12">
                    <div className="absolute top-0 right-0 flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 gap-2">
                            <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Share</span>
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                            <ShieldCheck className="w-12 h-12 sm:w-16 sm:h-16 text-white/40" />
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">{displayName}</h1>
                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Verified by Verivo
                                </Badge>
                            </div>
                            <p className="text-gray-400 font-mono text-sm mb-4">@{expert.username}</p>

                            <div className="flex gap-4 text-xs text-gray-500 uppercase font-bold tracking-widest">
                                {expert.geography && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {expert.geography}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Joined 2024
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end p-4 bg-white/5 border border-white/10 rounded-2xl glass-card w-full md:w-auto">
                            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Verivo Score</div>
                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                                {stats.verivo_score.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Credible Accuracy</div>
                            <div className="text-2xl sm:text-3xl font-bold text-white">{(stats.accuracy_rate * 100).toFixed(1)}%</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Confidence Factor</div>
                            <div className="text-2xl sm:text-3xl font-bold text-white">
                                {(performance.confidenceFactor || 0).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Total Predictions</div>
                            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.total_predictions}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Correct Predictions</div>
                            <div className="text-2xl sm:text-3xl font-bold text-green-400">{stats.correct_predictions}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 3. Main Content: Performance & Feed */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Performance Breakdown Tabs */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Performance Breakdown</h3>
                            </div>
                            <ProfilePerformanceTabs predictions={performance.predictions || []} />
                        </div>

                        {/* Verified Reports */}
                        <div className="p-6 bg-gradient-to-br from-purple-900/10 to-blue-900/10 border border-purple-500/20 rounded-2xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-purple-400" /> Verified Performance Reports
                                    </h3>
                                    <p className="text-sm text-gray-400">Generate a tamper-proof PDF report of {displayName}'s track record.</p>
                                </div>
                                <DownloadReportButton
                                    userData={{
                                        userId: expert.id,
                                        name: expert.name,
                                        username: expert.username,
                                        verivoScore: stats.verivo_score,
                                        accuracy: stats.accuracy_rate * 100,
                                        confidenceFactor: performance.confidenceFactor,
                                        totalPredictions: stats.total_predictions,
                                        correctPredictions: stats.correct_predictions
                                    }}
                                />
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Recent Verified Activity</h3>
                            <div className="space-y-3">
                                {performance.predictions && performance.predictions.length > 0 ? (
                                    performance.predictions.slice(0, 5).map((p: any) => (
                                        <div key={p.id} className="opacity-90 hover:opacity-100 transition-opacity">
                                            <PredictionCard prediction={p} showFull={true} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                                        <p className="text-gray-500 text-sm">No recent verified activity.</p>
                                    </div>
                                )}
                            </div>
                            {performance.predictions && performance.predictions.length > 5 && (
                                <div className="text-center pt-4">
                                    <Link href={`/experts/${expert.id}`} className="text-xs text-purple-400 hover:text-purple-300 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                                        View Full History <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* 4. Sidebar: Highlights */}
                    <div className="space-y-6">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Highlights</h4>
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/20">
                                    Verified Expert
                                </Badge>
                                {stats.total_predictions > 50 && (
                                    <Badge className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/20">
                                        High Volume
                                    </Badge>
                                )}
                                {((stats.accuracy_rate * 100) > 60) && (
                                    <Badge className="bg-green-500/10 hover:bg-green-500/20 text-green-300 border-green-500/20">
                                        Top Performer
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Profile Link</h4>
                            <div className="flex items-center gap-2 p-2 bg-black/30 rounded border border-white/10">
                                <code className="text-[10px] text-gray-400 flex-1 truncate">
                                    verivo.app/expert/{expert.username}
                                </code>
                                {/* Copy button would need client interaction, omitting for standard server component or use a client wrapper */}
                                <Copy className="w-3 h-3 text-gray-500 cursor-pointer hover:text-white" />
                            </div>
                        </div>

                        <div className="p-6 bg-blue-900/10 border border-blue-500/10 rounded-2xl">
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Verification Tech</h4>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                                Data on this profile is cryptographically signed and verified by Verivo's consensus protocol.
                                Reports are immutable and timestamped.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
