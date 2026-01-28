import Link from "next/link"
import { getFollowingList } from "@/lib/actions/follow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, User } from "lucide-react"

export async function FollowingList() {
    const following = await getFollowingList()

    return (
        <Card className="glass-card border-white/10 h-full">
            <CardHeader className="pb-3 border-b border-white/10">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                    Following
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {following.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p className="text-sm">You are not following any experts yet.</p>
                        <p className="text-xs mt-2">Find experts in the Intel Feed to follow.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {following.map((expert) => (
                            <Link
                                key={expert.expertId}
                                href={`/experts/${expert.expertId}`}
                                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-purple-200">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                                            {expert.name || expert.username || "Expert"}
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            @{expert.username || "user"}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Score</div>
                                    <div className="text-lg font-bold text-white font-mono">
                                        {typeof expert.verivoScore === 'number'
                                            ? expert.verivoScore.toFixed(2)
                                            : 'N/A'}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
