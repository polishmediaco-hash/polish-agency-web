/**
 * Notification Service
 * Sends instant alert notifications when new brand or creator applications arrive.
 * Supported Channels:
 * 1. Telegram Bot (Free, instant push to your phone)
 * 2. Discord / Slack / Custom Webhooks (Free real-time channel alert)
 * 3. WhatsApp Direct Fast-Track (Client pings founder via WhatsApp)
 */

async function notifyNewLead(lead) {
  console.log(`[POLISH Lead Engine] New application received: ${lead.id} | ${lead.fullName || lead.name}`);

  const isCreator = lead.type === 'CREATOR_PARTNERSHIP';
  const leadTitle = isCreator ? '🌟 New Creator Application' : '💼 New Brand Growth Dossier';
  const name = isCreator ? lead.name : lead.fullName;
  const subDetail = isCreator ? `Platform: ${lead.socialLink}` : `Brand: ${lead.brandName} (${lead.businessCategory})`;

  // 1. Telegram Bot Notification (If TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID are set)
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    try {
      const tgText = isCreator
        ? `🚨 *POLISH — New Creator Application!*\n\n` +
          `👤 *Name:* ${escapeTg(lead.name)}\n` +
          `📱 *Social:* ${escapeTg(lead.socialLink)}\n` +
          `📎 *Portfolio:* ${escapeTg(lead.portfolio || 'None')}\n` +
          `📞 *Phone/WA:* ${escapeTg(lead.phone || 'None')}\n` +
          `🆔 *Ref:* \`${lead.id}\``
        : `🚨 *POLISH — New Brand Application!*\n\n` +
          `🏢 *Brand:* ${escapeTg(lead.brandName)}\n` +
          `👤 *Contact:* ${escapeTg(lead.fullName)} (${escapeTg(lead.role)})\n` +
          `💄 *Category:* ${escapeTg(lead.businessCategory)}\n` +
          `🌐 *Website:* ${escapeTg(lead.websiteUrl || 'None')}\n` +
          `📱 *Social:* ${escapeTg(lead.socialLink || 'None')}\n` +
          `📊 *Status:* ${escapeTg(lead.marketingHistory || 'None')}\n` +
          `🎯 *Goal:* ${escapeTg(lead.primaryGoal || 'None')}\n` +
          `🆔 *Ref:* \`${lead.id}\``;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: tgText,
          parse_mode: 'Markdown'
        })
      });
      console.log('[Notification Service] Telegram notification dispatched successfully.');
    } catch (err) {
      console.error('[Notification Service] Telegram dispatch error:', err.message);
    }
  }

  // 2. Discord / Slack / Custom Webhook Notification (If WEBHOOK_URL is set)
  if (process.env.WEBHOOK_URL) {
    try {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: isCreator
            ? `🚨 **New POLISH Creator Application!**\n**Name:** ${lead.name}\n**Social:** ${lead.socialLink}\n**Phone:** ${lead.phone}\n**Portfolio:** ${lead.portfolio}\n**ID:** \`${lead.id}\``
            : `🚨 **New POLISH Growth Application!**\n**Brand:** ${lead.brandName} (${lead.businessCategory})\n**Contact:** ${lead.fullName} (${lead.role})\n**Website:** ${lead.websiteUrl}\n**Social:** ${lead.socialLink}\n**Goal:** ${lead.primaryGoal}\n**ID:** \`${lead.id}\``
        })
      });
      console.log('[Notification Service] Webhook alert dispatched successfully.');
    } catch (err) {
      console.error('[Notification Service] Webhook dispatch error:', err.message);
    }
  }

  return { success: true };
}

function escapeTg(str) {
  if (!str) return '—';
  return String(str).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

module.exports = { notifyNewLead };
