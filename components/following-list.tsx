import Link from "next/link"
import { getFollowingList } from "@/lib/actions/follow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, User, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FollowButton } from "@/components/follow-button"

export async function FollowingList() {
    const following = await getFollowingList()

    return (
        <Card className="glass-card border-white/10 h-full">
            <CardHeader className="pb-3 border-b border-white/10">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                    Following ({following.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {following.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                            <User className="w-6 h-6 text-white/20" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white/60">You are not following any experts yet.</p>
                            <p className="text-xs text-gray-500 mt-1">Discover verified experts to track their performance.</p>
                        </div>
                        <Link href="/experts">
                            <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                                Discover Experts
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {following.map((expert) => (
                            <div
                                key={expert.expertId}
                                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-purple-200 shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-semibold text-white truncate max-w-[150px]">
                                            {expert.name || expert.username || "Expert"}
                                        </h4>
                                        <span className="text-xs text-gray-500 block truncate">
                                            @{expert.username || "user"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Score */}
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Score</div>
                                        <div className="text-sm font-bold text-white font-mono">
                                            {typeof expert.verivoScore === 'number'
                                                ? expert.verivoScore.toFixed(2)
                                                : 'N/A'}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Link href={`/experts/${expert.expertId}`}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10">
                                                <ExternalLink className="w-4 h-4" />
                                                <span className="sr-only">View Profile</span>
                                            </Button>
                                        </Link>

                                        <div className="scale-90 origin-right">
                                            <FollowButton expertId={expert.expertId} initialIsFollowing={true} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
