/**
 * Notification Service
 * Sends instant alert notifications when new brand/creator applications arrive or Calendly meetings are booked.
 * Supported Channels:
 * 1. UltraMsg WhatsApp Gateway (Direct WhatsApp push to founder)
 * 2. Telegram Bot (Instant push to phone)
 * 3. Discord / Slack / Custom Webhooks (Real-time channel alert)
 */

/**
 * Formats a raw recipient phone number or group ID into Green-API / WhatsApp chat ID format.
 */
function formatChatId(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  if (str.includes('@g.us') || str.includes('@c.us')) {
    return str;
  }
  // WhatsApp Group IDs typically start with 120363 or have > 15 digits
  if (str.length > 15 || str.startsWith('120363')) {
    return `${str}@g.us`;
  }
  const cleanNumber = str.replace(/\D/g, '');
  if (!cleanNumber) return '';
  return `${cleanNumber}@c.us`;
}

/**
 * Resolves all configured notification recipients.
 * If both direct phone and group ID are configured, dispatches to BOTH for redundancy.
 */
function getWhatsAppTargets(overrideTarget) {
  if (overrideTarget) {
    const list = Array.isArray(overrideTarget) ? overrideTarget : [overrideTarget];
    return list.map(formatChatId).filter(Boolean);
  }

  const targets = new Set();

  // 1. Direct phone number (Push directly to founder)
  const directNum = (
    process.env.WHATSAPP_ALERT_NUMBER ||
    process.env.WHATSAPP_NUMBER ||
    '213662417761'
  ).trim();
  if (directNum) {
    const formatted = formatChatId(directNum);
    if (formatted) targets.add(formatted);
  }

  // 2. Alert Group Chat ID (Push to team/audit group)
  const groupChatId = (process.env.WHATSAPP_ALERT_CHAT_ID || '').trim();
  if (groupChatId) {
    const formatted = formatChatId(groupChatId);
    if (formatted) targets.add(formatted);
  }

  if (targets.size === 0) {
    targets.add('213662417761@c.us');
  }

  return Array.from(targets);
}

async function sendWhatsAppMessage(text, overrideTarget = null) {
  const targets = getWhatsAppTargets(overrideTarget);

  // 1. GREEN-API (Free Developer Plan Gateway)
  const greenApiUrl = process.env.GREEN_API_URL || 'https://7105.api.greenapi.com';
  const greenId = process.env.GREEN_API_ID_INSTANCE;
  const greenToken = process.env.GREEN_API_TOKEN_INSTANCE;

  if (greenId && greenToken) {
    const endpoint = `${greenApiUrl.replace(/\/$/, '')}/waInstance${greenId}/sendMessage/${greenToken}`;
    const dispatches = [];

    for (const chatId of targets) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: chatId,
            message: text
          })
        });
        const resData = await res.json();
        const success = res.ok && Boolean(resData.idMessage);
        dispatches.push({
          chatId,
          success,
          messageId: resData.idMessage || null,
          data: resData
        });
        console.log(`[Notification Service] Green-API WhatsApp alert to ${chatId}:`, resData);
      } catch (err) {
        console.error(`[Notification Service] Green-API WhatsApp alert to ${chatId} failed:`, err.message);
        dispatches.push({
          chatId,
          success: false,
          error: err.message
        });
      }
    }

    const anySuccess = dispatches.some(d => d.success);
    return {
      success: anySuccess,
      provider: 'green-api',
      targets,
      dispatches
    };
  }

  // 2. UltraMsg (Fallback if configured)
  const ultraInstance = process.env.ULTRAMSG_INSTANCE_ID;
  const ultraToken = process.env.ULTRAMSG_TOKEN;
  if (ultraInstance && ultraToken) {
    const dispatches = [];
    for (const target of targets) {
      try {
        const targetNumber = target.replace(/@(c|g)\.us$/, '').replace(/\D/g, '');
        const params = new URLSearchParams();
        params.append('token', ultraToken);
        params.append('to', targetNumber);
        params.append('body', text);

        const res = await fetch(`https://api.ultramsg.com/${ultraInstance}/messages/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });
        const resData = await res.json();
        dispatches.push({
          target,
          success: res.ok,
          data: resData
        });
        console.log(`[Notification Service] UltraMsg alert to ${target}:`, resData);
      } catch (err) {
        dispatches.push({
          target,
          success: false,
          error: err.message
        });
      }
    }
    return {
      success: dispatches.some(d => d.success),
      provider: 'ultramsg',
      targets,
      dispatches
    };
  }

  console.log('[Notification Service] No WhatsApp credentials configured in .env. Skipping WhatsApp alert.');
  return { skipped: true, reason: 'Missing GREEN_API or ULTRAMSG credentials' };
}

async function notifyNewLead(lead) {
  console.log(`[POLISH Lead Engine] New application received: ${lead.id} | ${lead.fullName || lead.name}`);

  const isCreator = lead.type === 'CREATOR_PARTNERSHIP';
  const isIntake = lead.type === 'STRATEGY_INTAKE';

  // 1. WhatsApp Alert (via UltraMsg)
  let waText = '';
  if (isCreator) {
    waText = `*POLISH — New Creator Application* 🌟\n\n` +
      `*Name:* ${lead.name}\n` +
      `*Social:* ${lead.socialLink}\n` +
      `*Phone:* ${lead.phone || 'None'}\n` +
      `*Portfolio:* ${lead.portfolio || 'None'}\n` +
      `*Ref:* ${lead.id}`;
  } else if (isIntake) {
    waText = `*POLISH — New Strategy Intake* 📋\n\n` +
      `*Client:* ${lead.fullName}\n` +
      `*Container:* ${lead.brandName || 'Executive Advisory'}\n` +
      `*Phone:* ${lead.phone || 'None'}\n` +
      `*Goal:* ${lead.primaryGoal || 'None'}\n` +
      `*Ref:* ${lead.id}`;
  } else {
    waText = `*POLISH — New Brand Application* 💼\n\n` +
      `*Brand:* ${lead.brandName}\n` +
      `*Contact:* ${lead.fullName} (${lead.role})\n` +
      `*Email:* ${lead.email || 'None'}\n` +
      `*Phone/WA:* ${lead.phone || 'None'}\n` +
      `*Category:* ${lead.businessCategory}\n` +
      `*Revenue:* ${lead.monthlyRevenue || 'Not specified'}\n` +
      `*Website:* ${lead.websiteUrl || 'None'}\n` +
      `*Social:* ${lead.socialLink || 'None'}\n` +
      `*Status:* ${lead.marketingHistory || 'None'}\n` +
      `*Goal:* ${lead.primaryGoal || 'None'}\n` +
      `*Ref:* ${lead.id}`;
  }

  // 1. WhatsApp Alert (via Green-API / UltraMsg)
  let waResult = null;
  try {
    waResult = await sendWhatsAppMessage(waText);
  } catch (err) {
    console.error('[Notification Service] WhatsApp lead notification error:', err.message);
    waResult = { success: false, error: err.message };
  }

  // 2. Telegram Bot Notification
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    try {
      let tgText = '';
      if (isCreator) {
        tgText = `🌟 *POLISH — New Creator Application!*\n\n` +
          `👤 *Name:* ${escapeTg(lead.name)}\n` +
          `📱 *Social:* ${escapeTg(lead.socialLink)}\n` +
          `📎 *Portfolio:* ${escapeTg(lead.portfolio || 'None')}\n` +
          `📞 *Phone/WA:* ${escapeTg(lead.phone || 'None')}\n` +
          `🆔 *Ref:* \`${lead.id}\``;
      } else if (isIntake) {
        tgText = `📋 *POLISH — New Strategy Intake!*\n\n` +
          `👤 *Client:* ${escapeTg(lead.fullName)}\n` +
          `🏢 *Container:* ${escapeTg(lead.brandName)}\n` +
          `📞 *Phone/WA:* ${escapeTg(lead.phone || 'None')}\n` +
          `🎯 *Goal:* ${escapeTg(lead.primaryGoal || 'None')}\n` +
          `🆔 *Ref:* \`${lead.id}\``;
      } else {
        tgText = `💼 *POLISH — New Brand Application!*\n\n` +
          `🏢 *Brand:* ${escapeTg(lead.brandName)}\n` +
          `👤 *Contact:* ${escapeTg(lead.fullName)} (${escapeTg(lead.role)})\n` +
          `✉️ *Email:* ${escapeTg(lead.email || 'None')}\n` +
          `📞 *Phone/WA:* ${escapeTg(lead.phone || 'None')}\n` +
          `💄 *Category:* ${escapeTg(lead.businessCategory)}\n` +
          `💰 *Revenue:* ${escapeTg(lead.monthlyRevenue || 'Not specified')}\n` +
          `🌐 *Website:* ${escapeTg(lead.websiteUrl || 'None')}\n` +
          `📱 *Social:* ${escapeTg(lead.socialLink || 'None')}\n` +
          `📊 *Status:* ${escapeTg(lead.marketingHistory || 'None')}\n` +
          `🎯 *Goal:* ${escapeTg(lead.primaryGoal || 'None')}\n` +
          `🆔 *Ref:* \`${lead.id}\``;
      }

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: tgText,
          parse_mode: 'Markdown'
        })
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.warn(`[Notification Service] Telegram alert failed (${res.status}):`, errBody);
      } else {
        console.log('[Notification Service] Telegram alert dispatched successfully.');
      }
    } catch (err) {
      console.error('[Notification Service] Telegram dispatch error:', err.message);
    }
  }

  // 3. Discord / Slack / Custom Webhook Notification (If WEBHOOK_URL is set)
  if (process.env.WEBHOOK_URL) {
    try {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: isCreator
            ? `🚨 **New POLISH Creator Application!**\n**Name:** ${lead.name}\n**Social:** ${lead.socialLink}\n**Phone:** ${lead.phone}\n**Portfolio:** ${lead.portfolio}\n**ID:** \`${lead.id}\``
            : isIntake
            ? `📋 **New POLISH Strategy Intake!**\n**Client:** ${lead.fullName}\n**Container:** ${lead.brandName}\n**Phone:** ${lead.phone}\n**ID:** \`${lead.id}\``
            : `🚨 **New POLISH Growth Application!**\n**Brand:** ${lead.brandName} (${lead.businessCategory})\n**Contact:** ${lead.fullName} (${lead.role})\n**Email:** ${lead.email || 'None'}\n**Phone:** ${lead.phone || 'None'}\n**Revenue:** ${lead.monthlyRevenue || 'Not specified'}\n**Website:** ${lead.websiteUrl}\n**Social:** ${lead.socialLink}\n**Goal:** ${lead.primaryGoal}\n**ID:** \`${lead.id}\``
        })
      });
      console.log('[Notification Service] Webhook alert dispatched successfully.');
    } catch (err) {
      console.error('[Notification Service] Webhook dispatch error:', err.message);
    }
  }

  return { success: true, leadId: lead.id, whatsapp: waResult };
}

async function notifyNewMeeting(meeting) {
  console.log(`[POLISH Meeting Engine] New Calendly meeting scheduled: ${meeting.id} | ${meeting.fullName}`);

  const startTimeFormatted = meeting.startTime
    ? new Date(meeting.startTime).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'UTC'
      }) + ' UTC'
    : 'Not specified';

  // 1. WhatsApp Alert (via Green-API / UltraMsg)
  const waText = `*POLISH — New Meeting Scheduled!* 📅\n\n` +
    `*Invitee:* ${meeting.fullName}\n` +
    `*Email:* ${meeting.email || 'None'}\n` +
    `*Meeting:* ${meeting.eventName || 'Strategy Session'}\n` +
    `*Time:* ${startTimeFormatted}\n` +
    `*Join Link:* ${meeting.joinUrl || 'Calendly Link'}\n` +
    (meeting.brand ? `*Brand:* ${meeting.brand}\n` : '') +
    (meeting.notes ? `*Notes:* ${meeting.notes}\n` : '') +
    `*Ref:* ${meeting.id}`;

  let waResult = null;
  try {
    waResult = await sendWhatsAppMessage(waText);
  } catch (err) {
    console.error('[Notification Service] Async WhatsApp error for meeting:', err.message);
    waResult = { success: false, error: err.message };
  }

  // 2. Telegram Alert
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    try {
      const tgText = `📅 *POLISH — New Meeting Scheduled!*\n\n` +
        `👤 *Invitee:* ${escapeTg(meeting.fullName)}\n` +
        `📧 *Email:* ${escapeTg(meeting.email || 'None')}\n` +
        `🏷️ *Meeting:* ${escapeTg(meeting.eventName || 'Strategy Session')}\n` +
        `🕒 *Time:* ${escapeTg(startTimeFormatted)}\n` +
        `🔗 *Join URL:* ${escapeTg(meeting.joinUrl || 'See Calendly')}\n` +
        (meeting.brand ? `🏢 *Brand:* ${escapeTg(meeting.brand)}\n` : '') +
        `🆔 *Ref:* \`${meeting.id}\``;

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: tgText,
          parse_mode: 'Markdown'
        })
      });
      const resData = await res.json();
      if (!resData.ok) {
        console.error('[Notification Service] Telegram meeting notification error:', resData);
      }
    } catch (err) {
      console.error('[Notification Service] Telegram meeting dispatch error:', err.message);
    }
  }

  // 3. Webhook Alert
  if (process.env.WEBHOOK_URL) {
    try {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `📅 **New POLISH Meeting Scheduled!**\n**Invitee:** ${meeting.fullName} (${meeting.email})\n**Meeting:** ${meeting.eventName}\n**Time:** ${startTimeFormatted}\n**Join:** ${meeting.joinUrl}\n**ID:** \`${meeting.id}\``
        })
      });
    } catch (err) {
      console.error('[Notification Service] Webhook meeting dispatch error:', err.message);
    }
  }

  return { success: true, meetingId: meeting.id, whatsapp: waResult };
}

function escapeTg(str) {
  if (!str) return '—';
  return String(str).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

module.exports = {
  notifyNewLead,
  notifyNewMeeting,
  sendWhatsAppMessage,
  getWhatsAppTargets,
  formatChatId
};
