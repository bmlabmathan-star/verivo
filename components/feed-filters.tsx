"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function FeedFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const category = searchParams.get("category") || "all"
    const status = searchParams.get("status") || "all"

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`/feed?${params.toString()}`)
    }

    return (
        <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Category:</label>
                <Select value={category} onValueChange={(value) => updateFilter("category", value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="commodity">Commodity</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Status:</label>
                <Select value={status} onValueChange={(value) => updateFilter("status", value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Predictions</SelectItem>
                        <SelectItem value="locked">Locked</SelectItem>
                        <SelectItem value="revealed">Revealed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
