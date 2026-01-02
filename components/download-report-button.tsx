"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import { VerifiedReportPDF, VerifiedReportData } from "@/components/verified-report-pdf"

interface DownloadReportButtonProps {
    userData: {
        userId: string
        name: string | null
        username: string | null
        verivoScore: number
        accuracy: number
        confidenceFactor: number
        totalPredictions: number
        correctPredictions: number
    }
    predictions?: any[]
}

export function DownloadReportButton({ userData, predictions }: DownloadReportButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        try {
            setLoading(true)

            // Generate Client-Side Report ID
            const generatedId = `VR-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            const generatedAt = new Date().toISOString()

            // Process Predictions for Report
            let todayStats = undefined;
            let history: { date: string, accuracy: number, total: number, correct: number }[] = [];

            if (predictions && predictions.length > 0) {
                // Today's Stats
                const today = new Date().toDateString();
                const todaysPreds = predictions.filter(p => new Date(p.created_at).toDateString() === today);

                if (todaysPreds.length > 0) {
                    const total = todaysPreds.length;
                    const correct = todaysPreds.filter(p => p.outcome === 'Correct').length;
                    const accuracy = (correct / total) * 100;

                    let status: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
                    if (accuracy >= 60) status = 'Positive';
                    if (accuracy < 40) status = 'Negative';

                    todayStats = {
                        date: new Date().toISOString(),
                        total,
                        correct,
                        accuracy,
                        status
                    };
                }

                // History (Last 30 Days)
                const historyMap = new Map<string, { date: string, total: number, correct: number }>();

                predictions.forEach(p => {
                    if (!p.outcome) return; // Only finished predictions for history
                    // Use evaluation time if available, else created_at
                    const dateVal = p.evaluation_time || p.created_at;
                    const dateKey = new Date(dateVal).toISOString().split('T')[0]; // YYYY-MM-DD

                    if (!historyMap.has(dateKey)) {
                        historyMap.set(dateKey, { date: dateVal, total: 0, correct: 0 });
                    }

                    const entry = historyMap.get(dateKey)!;
                    entry.total += 1;
                    if (p.outcome === 'Correct') entry.correct += 1;
                });

                history = Array.from(historyMap.values())
                    .map(h => ({
                        date: h.date,
                        total: h.total,
                        correct: h.correct,
                        accuracy: (h.correct / h.total) * 100
                    }))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            }

            // Prepare Data for PDF using Dashboard State
            const pdfData: VerifiedReportData = {
                reportId: generatedId,
                generatedAt: generatedAt,
                // Primary Identifier: Name or Username or Generic Title. NEVER "Contributor #ID"
                expertName: userData.name || (userData.username ? `@${userData.username}` : "Verified Expert"),
                // Pass extra fields for better formatting
                displayName: userData.name,
                username: userData.username,
                contributorId: userData.userId.slice(0, 4),
                verivoScore: userData.verivoScore,
                credibleAccuracy: userData.accuracy,
                confidenceFactor: userData.confidenceFactor,
                totalPredictions: userData.totalPredictions,
                correctPredictions: userData.correctPredictions,
                todayStats,
                history
            }

            // Generate PDF Blob Client-Side
            const blob = await pdf(<VerifiedReportPDF data={pdfData} />).toBlob()

            // Trigger Download
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `Verivo_Report_${generatedId}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

        } catch (error) {
            console.error("Download failed:", error)
            alert("Failed to generate report. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Only show button if user has at least a basic presence (id exists)
    // We allow generation even with 0 score if displayed on dashboard
    if (!userData.userId) return null

    return (
        <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="gap-2 border-white/20 hover:bg-white/10 text-xs sm:text-sm"
            disabled={loading}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Generating...</span>
                </>
            ) : (
                <>
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Download Verified Performance Report</span>
                    <span className="sm:hidden">Report</span>
                </>
            )}
        </Button>
    )
}
