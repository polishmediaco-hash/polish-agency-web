# Database Security

## File-Based JSON Storage (POLISH Media Current State)

The current architecture uses flat JSON files for data persistence:
- `server/db/leads.json` — inbound brand applications
- `server/db/content.json` — CMS content
- `server/db/boards/` — client strategy boards

### Known Risks

| Risk | Severity | Description |
|------|----------|-------------|
| Race conditions | HIGH | Concurrent writes can corrupt JSON files |
| No access control | HIGH | Any code path that knows the path can read/write all records |
| No audit trail | MEDIUM | No log of who changed what and when |
| No backup | HIGH | Single point of failure — one bad write destroys all data |
| No encryption at rest | MEDIUM | Plain text sensitive client data on disk |

### Atomic Write Pattern (Immediate Fix)

```javascript
const fs = require('fs');
const path = require('path');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function atomicWriteJson(filePath, data) {
  const dir = path.dirname(filePath);
  const tmpPath = path.join(dir, `.tmp.${Date.now()}.${Math.random()}`);
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, filePath); // atomic on same filesystem
}

// Usage
const leads = readJson(LEADS_FILE);
leads.push(newLead);
atomicWriteJson(LEADS_FILE, leads);
```

### Migration Recommendation

For production scale, migrate to a proper database:

| Option | Best For | Notes |
|--------|----------|-------|
| SQLite + better-sqlite3 | Small self-hosted apps | Synchronous, zero config, single file |
| Supabase (Postgres) | Cloud-native, real-time | Row-level security, built-in auth |
| PlanetScale | Serverless MySQL | Branching, scale to zero |
| MongoDB Atlas | Document-centric | Free tier, flexible schema |

## Firebase Security Rules

If Firebase Realtime Database or Firestore is used for client-side writes, security rules are critical:

```javascript
// BAD: anyone can read and write everything
{
  "rules": {
    ".read": true,
    ".write": true
  }
}

// GOOD: require authentication, scope to user's own data
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

Always test your Firebase rules with the Firebase Rules Playground before deploying.

## Sensitive Data in Boards

Client strategy boards stored in `server/db/boards/` contain sensitive business strategy and pricing information. Ensure:

1. Board access is gated behind Firebase Auth token verification
2. Board IDs are not sequential/guessable (use UUIDs)
3. `/b/:id` and `/view/:id` routes verify the viewer is authorized to see that board
