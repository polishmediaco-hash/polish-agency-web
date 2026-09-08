/**
 * Calendly Sync Service
 * Automatically detects newly scheduled meetings via Calendly API v2
 * and dispatches instant WhatsApp and Telegram notifications.
 *
 * Runs automatically every 60 seconds — No paid Calendly Standard plan required!
 */

const fs = require('fs');
const path = require('path');
const { notifyNewMeeting } = require('./notification');

const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
const DB_FILE = IS_VERCEL
  ? path.join('/tmp', 'leads.json')
  : path.join(__dirname, '../db/leads.json');

// In-memory set of notified event URIs
const notifiedEventUris = new Set();

function initNotifiedCache() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '[]');
      data.forEach(item => {
        if (item.type === 'CALENDLY_MEETING' && item.eventUri) {
          notifiedEventUris.add(item.eventUri);
        }
      });
    }
  } catch (e) {
    console.error('[Calendly Sync] Error loading cache:', e.message);
  }
}

async function checkNewCalendlyMeetings() {
  const token = process.env.CALENDLY_API_TOKEN;
  const userUri = process.env.CALENDLY_USER_URI || 'https://api.calendly.com/users/397725cc-ad8e-487c-b2e2-d7148e543125';

  if (!token) return;

  try {
    const url = `https://api.calendly.com/scheduled_events?user=${encodeURIComponent(userUri)}&status=active&sort=start_time:desc&count=10`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      console.error(`[Calendly Sync] API error: HTTP ${res.status}`);
      return;
    }

    const data = await res.json();
    const events = data.collection || [];

    for (const ev of events) {
      if (!ev.uri || notifiedEventUris.has(ev.uri)) continue;

      // Mark as seen immediately to avoid duplicates
      notifiedEventUris.add(ev.uri);

      // Only alert for events created in the last 48 hours or newly booked
      const createdAt = new Date(ev.created_at).getTime();
      const now = Date.now();
      const ageHours = (now - createdAt) / (1000 * 60 * 60);

      // Fetch invitee details
      let invitee = { name: 'Meeting Guest', email: 'Not provided' };
      try {
        const invRes = await fetch(`${ev.uri}/invitees`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (invRes.ok) {
          const invData = await invRes.json();
          if (invData.collection && invData.collection.length > 0) {
            invitee = invData.collection[0];
          }
        }
      } catch (err) {
        console.error('[Calendly Sync] Failed to fetch invitee:', err.message);
      }

      // Extract join link / location
      let joinUrl = 'See Calendly / Calendar Invite';
      if (ev.location) {
        if (typeof ev.location === 'string') joinUrl = ev.location;
        else if (ev.location.join_url) joinUrl = ev.location.join_url;
        else if (ev.location.location) joinUrl = ev.location.location;
      }

      // Extract answers
      let brand = '';
      let notes = '';
      if (invitee.questions_and_answers && Array.isArray(invitee.questions_and_answers)) {
        invitee.questions_and_answers.forEach(item => {
          const q = (item.question || '').toLowerCase();
          const a = item.answer || '';
          if (q.includes('brand') || q.includes('company')) brand = a;
          else if (a) notes += `${item.question}: ${a}\n`;
        });
      }

      const meetingRecord = {
        id: `MEET-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        type: 'CALENDLY_MEETING',
        eventUri: ev.uri,
        fullName: invitee.name || 'Meeting Guest',
        email: invitee.email || 'Not provided',
        brand: brand || 'Not specified',
        eventName: ev.name || 'Strategy Meeting',
        startTime: ev.start_time,
        joinUrl,
        notes: notes.trim(),
        submittedAt: ev.created_at || new Date().toISOString(),
        status: 'SCHEDULED'
      };

      // Persist to database
      try {
        let leads = [];
        if (fs.existsSync(DB_FILE)) {
          leads = JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '[]');
        }
        leads.unshift(meetingRecord);
        fs.writeFileSync(DB_FILE, JSON.stringify(leads, null, 2), 'utf8');
      } catch (fsErr) {
        console.error('[Calendly Sync] Error writing meeting to DB:', fsErr.message);
      }

      // Only dispatch notifications if meeting was booked within last 24h
      if (ageHours <= 24) {
        console.log(`[Calendly Sync] New meeting discovered! Alerting WhatsApp: ${meetingRecord.fullName}`);
        notifyNewMeeting(meetingRecord).catch(console.error);
      }
    }
  } catch (err) {
    console.error('[Calendly Sync] Polling error:', err.message);
  }
}

function startCalendlyPoller(intervalSeconds = 60) {
  initNotifiedCache();
  // Run once on startup
  checkNewCalendlyMeetings();
  // Then run on interval
  const timer = setInterval(checkNewCalendlyMeetings, intervalSeconds * 1000);
  if (timer.unref) timer.unref(); // Allow clean process exit
  console.log(`[Calendly Sync Engine] Active. Polling every ${intervalSeconds}s for new meetings.`);
}

module.exports = {
  startCalendlyPoller,
  checkNewCalendlyMeetings
};
