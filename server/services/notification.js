/**
 * Notification Service
 * Sends alert triggers when high-ticket applications arrive.
 * Can be hooked into Discord Webhooks, Slack, Resend, or SMS.
 */

async function notifyNewLead(lead) {
  console.log(`[POLISH Lead Engine] New application received from: ${lead.fullName} (${lead.brandName})`);
  console.log(`[POLISH Lead Engine] Category: ${lead.businessCategory} | Role: ${lead.role}`);
  console.log(`[POLISH Lead Engine] Direct Email: ${lead.email} | WhatsApp: ${process.env.WHATSAPP_NUMBER}`);

  // Optional: If a DISCORD_WEBHOOK or SLACK_WEBHOOK is configured in .env, dispatch payload
  if (process.env.WEBHOOK_URL) {
    try {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **New POLISH Growth Application Received!**\n**Brand:** ${lead.brandName} (${lead.businessCategory})\n**Contact:** ${lead.fullName} <${lead.email}>\n**Website:** ${lead.websiteUrl}\n**Role:** ${lead.role}\n**12-Mo Goal:** ${lead.primaryGoal}`
        })
      });
    } catch (err) {
      console.error('[Notification Service] Webhook dispatch error:', err.message);
    }
  }

  return { success: true };
}

module.exports = { notifyNewLead };
