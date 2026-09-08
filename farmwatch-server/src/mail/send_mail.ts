import nodemailer from "nodemailer";
import { InvestigationResult } from "../types/types";

require("dotenv").config();

const transporter =
    nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

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

    const result =
        await transporter.sendMail({
            from: `"FarmWatch" <${process.env.GMAIL_USER}>`,

            to: farmerEmail,

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
        result.messageId
    );

    return result;
}
