/**
 * Notification Service
 * Sends instant alert notifications when new brand/creator applications arrive or Calendly meetings are booked.
 * Supported Channels:
 * 1. UltraMsg WhatsApp Gateway (Direct WhatsApp push to founder)
 * 2. Telegram Bot (Instant push to phone)
 * 3. Discord / Slack / Custom Webhooks (Real-time channel alert)
 */

async function sendWhatsAppMessage(text) {
  const rawTarget = (
    process.env.WHATSAPP_ALERT_CHAT_ID ||
    process.env.WHATSAPP_ALERT_NUMBER ||
    process.env.WHATSAPP_NUMBER ||
    '213662417761'
  ).trim();

  let chatId = '';
  if (rawTarget.includes('@g.us') || rawTarget.includes('@c.us')) {
    chatId = rawTarget;
  } else if (rawTarget.length > 15 || rawTarget.startsWith('120363')) {
    chatId = `${rawTarget}@g.us`;
  } else {
    const cleanNumber = rawTarget.replace(/\D/g, '');
    chatId = `${cleanNumber}@c.us`;
  }

  // 1. GREEN-API (Free Developer Plan Gateway)
  const greenApiUrl = process.env.GREEN_API_URL || 'https://7105.api.greenapi.com';
  const greenId = process.env.GREEN_API_ID_INSTANCE;
  const greenToken = process.env.GREEN_API_TOKEN_INSTANCE;

  if (greenId && greenToken) {
    try {
      const endpoint = `${greenApiUrl.replace(/\/$/, '')}/waInstance${greenId}/sendMessage/${greenToken}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          message: text
        })
      });
      const resData = await res.json();
      console.log(`[Notification Service] Green-API WhatsApp alert dispatched to ${chatId}:`, resData);
      return { success: true, provider: 'green-api', chatId, data: resData };
    } catch (err) {
      console.error('[Notification Service] Green-API WhatsApp dispatch error:', err.message);
      return { success: false, provider: 'green-api', error: err.message };
    }
  }

  // 2. UltraMsg (Fallback if configured)
  const ultraInstance = process.env.ULTRAMSG_INSTANCE_ID;
  const ultraToken = process.env.ULTRAMSG_TOKEN;
  if (ultraInstance && ultraToken) {
    try {
      const targetNumber = rawTarget.replace(/\D/g, '');
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
      console.log('[Notification Service] UltraMsg WhatsApp alert sent:', resData);
      return { success: true, provider: 'ultramsg', data: resData };
    } catch (err) {
      console.error('[Notification Service] UltraMsg WhatsApp dispatch error:', err.message);
      return { success: false, provider: 'ultramsg', error: err.message };
    }
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
      `*Category:* ${lead.businessCategory}\n` +
      `*Website:* ${lead.websiteUrl || 'None'}\n` +
      `*Social:* ${lead.socialLink || 'None'}\n` +
      `*Status:* ${lead.marketingHistory || 'None'}\n` +
      `*Goal:* ${lead.primaryGoal || 'None'}\n` +
      `*Ref:* ${lead.id}`;
  }

  sendWhatsAppMessage(waText).catch(err => {
    console.error('[Notification Service] Async WhatsApp error:', err.message);
  });

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
          `💄 *Category:* ${escapeTg(lead.businessCategory)}\n` +
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
      const resData = await res.json();
      if (!resData.ok) {
        console.error('[Notification Service] Telegram API responded with error:', resData);
      } else {
        console.log('[Notification Service] Telegram notification dispatched successfully.');
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

async function notifyNewMeeting(meeting) {
  console.log(`[POLISH Meeting Engine] New Calendly meeting scheduled: ${meeting.id} | ${meeting.fullName}`);

  const startTimeFormatted = meeting.startTime
    ? new Date(meeting.startTime).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'UTC'
      }) + ' UTC'
    : 'Not specified';

  // 1. WhatsApp Alert (via UltraMsg)
  const waText = `*POLISH — New Meeting Scheduled!* 📅\n\n` +
    `*Invitee:* ${meeting.fullName}\n` +
    `*Email:* ${meeting.email || 'None'}\n` +
    `*Meeting:* ${meeting.eventName || 'Strategy Session'}\n` +
    `*Time:* ${startTimeFormatted}\n` +
    `*Join Link:* ${meeting.joinUrl || 'Calendly Link'}\n` +
    (meeting.brand ? `*Brand:* ${meeting.brand}\n` : '') +
    (meeting.notes ? `*Notes:* ${meeting.notes}\n` : '') +
    `*Ref:* ${meeting.id}`;

  sendWhatsAppMessage(waText).catch(err => {
    console.error('[Notification Service] Async WhatsApp error for meeting:', err.message);
  });

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

  return { success: true };
}

function escapeTg(str) {
  if (!str) return '—';
  return String(str).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

module.exports = { notifyNewLead, notifyNewMeeting, sendWhatsAppMessage };
