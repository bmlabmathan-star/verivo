"use server"

import { createClient } from "@/lib/supabase/server"

export type VerifiedReportResult = {
    report: {
        id: string
        user_id: string
        generated_at: string
        verivo_score: number
        credible_accuracy: number
        confidence_factor: number
        total_predictions: number
        correct_predictions: number
    }
    expertName: string | null
}

export async function generateVerifiedReport(): Promise<VerifiedReportResult> {
    const supabase = await createClient()

    // 1. Generate Report via RPC (Secure)
    // The RPC 'create_verified_report' verifies metrics from the database views 
    // and creates a permanent record with a unique ID.
    const { data: report, error } = await supabase.rpc('create_verified_report')

    if (error) {
        console.error("Error creating report:", error)
        throw new Error("Failed to generate verified report. Please try again.")
    }

    if (!report) {
        throw new Error("Report generation failed: No data returned.")
    }

    // 2. Fetch Expert Profile Name
    // We try to find a username or name to display on the report.
    let expertName = null

    if (report.user_id) {
        // Try to fetch from experts table or verivo_users if exists
        // Based on codebase, 'experts' table seems to be the profile source
        const { data: expert } = await supabase
            .from('experts')
            .select('name, username')
            .eq('id', report.user_id)
            .single()

        // Fallback logic
        if (expert) {
            expertName = expert.username || expert.name || null
        }

        // If still null, we might use the ID formatted like the profile page
        if (!expertName) {
            expertName = `Contributor #${report.user_id.slice(0, 4)}`
        }
    }

    return {
        report,
        expertName
    }
}
