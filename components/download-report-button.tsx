"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, Download } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import { generateVerifiedReport } from "@/lib/actions/reports"
import { VerifiedReportPDF, VerifiedReportData } from "@/components/verified-report-pdf"

export function DownloadReportButton() {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        try {
            setLoading(true)

            // 1. Generate Report on Backend (Secure)
            const { report, expertName } = await generateVerifiedReport()

            // 2. Prepare Data for PDF
            const pdfData: VerifiedReportData = {
                reportId: report.id,
                generatedAt: report.generated_at,
                expertName: expertName,
                verivoScore: report.verivo_score,
                credibleAccuracy: report.credible_accuracy,
                confidenceFactor: report.confidence_factor,
                totalPredictions: report.total_predictions,
                correctPredictions: report.correct_predictions
            }

            // 3. Generate PDF Blob Client-Side
            const blob = await pdf(<VerifiedReportPDF data={pdfData} />).toBlob()

            // 4. Trigger Download
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `Verivo_Report_${report.id}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

        } catch (error) {
            console.error("Download failed:", error)
            alert("Failed to generate verified report. Please ensure you are logged in and have verified metrics.")
        } finally {
            setLoading(false)
        }
    }

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
