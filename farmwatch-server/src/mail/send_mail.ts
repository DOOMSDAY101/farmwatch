import nodemailer from "nodemailer";
import { InvestigationResult } from "../types/types";
import { Resend } from "resend";

require("dotenv").config();

const resend = new Resend(
    process.env.RESEND_API_KEY
);

export async function sendFarmAlertEmail(
    investigation: InvestigationResult
) {
    const farmerEmail =
        process.env.FARMER_EMAIL;

    if (!farmerEmail) {
        throw new Error(
            "FARMER_EMAIL is not configured"
        );
    }

    const { data, error } =
        await resend.emails.send({
            from: "FarmWatch <onboarding@resend.dev>",

            to: [farmerEmail],

            subject:
                `🚨 FarmWatch Alert - ${investigation.severity} anomaly`,

            text: `
FarmWatch has detected an anomaly on your farm.

Finding:
${investigation.finding}

Evidence:
${investigation.evidence
                    .map(item => `- ${item}`)
                    .join("\n")}

Historical comparison:
${investigation.historicalComparison}

Likely explanation:
${investigation.likelyExplanation}

Severity:
${investigation.severity}

Human attention recommended:
${investigation.humanAttentionRecommended ? "Yes" : "No"}

Please investigate the farm conditions.
            `.trim(),
        });

    console.log(
        "📧 FarmWatch email sent:",
        data?.id
    );

    return data;
}
