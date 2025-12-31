"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import { VerifiedReportPDF, VerifiedReportData } from "@/components/verified-report-pdf"

interface DownloadReportButtonProps {
    userData: {
        userId: string
        verivoScore: number
        accuracy: number
        confidenceFactor: number
        totalPredictions: number
        correctPredictions: number
    }
}

export function DownloadReportButton({ userData }: DownloadReportButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        try {
            setLoading(true)

            // Generate Client-Side Report ID (Frontend Only Fix)
            const generatedId = `VR-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            const generatedAt = new Date().toISOString()
            const expertName = `Contributor #${userData.userId.slice(0, 4)}`

            // Prepare Data for PDF using Dashboard State
            const pdfData: VerifiedReportData = {
                reportId: generatedId,
                generatedAt: generatedAt,
                expertName: expertName,
                verivoScore: userData.verivoScore,
                credibleAccuracy: userData.accuracy,
                confidenceFactor: userData.confidenceFactor,
                totalPredictions: userData.totalPredictions,
                correctPredictions: userData.correctPredictions
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
