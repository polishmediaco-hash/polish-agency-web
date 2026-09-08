# Data Access & Input Validation

## SQL Injection (If Using Raw Queries)

Always use parameterized queries or ORM methods. Never concatenate user input into SQL strings:

```javascript
// BAD: SQL injection via string concatenation
const result = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);

// GOOD: parameterized query
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

## Input Validation for Express APIs

All incoming request bodies must be validated before use. Do NOT trust `req.body` directly.

```javascript
// BAD: trust whatever the client sends
app.post('/api/apply', (req, res) => {
  const { name, email, budget } = req.body;
  // Write directly to file/DB with no validation
  saveApplication({ name, email, budget });
});

// GOOD: validate shape and sanitize
const { body, validationResult } = require('express-validator');

app.post('/api/apply',
  body('email').isEmail().normalizeEmail(),
  body('name').isString().trim().isLength({ min: 1, max: 100 }),
  body('budget').isNumeric().toFloat(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Now safe to use req.body
  }
);
```

## File Upload Security

If you add file upload capabilities:

- **Validate MIME type on the server** — not just the extension. Clients can lie.
- **Validate file size** before reading content.
- **Never store uploads in the public directory** without sanitization.
- **Rename uploaded files** — never use the client-provided filename.
- **Scan for malware** if accepting arbitrary files.

```javascript
// BAD: trust client-provided filename and MIME type
app.post('/upload', (req, res) => {
  fs.writeFileSync(`public/uploads/${req.file.originalname}`, req.file.buffer);
});

// GOOD: sanitize and rename
const path = require('path');
const crypto = require('crypto');

app.post('/upload', upload.single('file'), (req, res) => {
  const ext = path.extname(req.file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  if (!allowedExts.includes(ext)) return res.status(400).json({ error: 'File type not allowed' });
  
  const safeName = `${crypto.randomUUID()}${ext}`;
  fs.writeFileSync(path.join(__dirname, '../uploads', safeName), req.file.buffer);
  res.json({ filename: safeName });
});
```

## JSON File Storage Race Conditions (POLISH Media Specific)

The current flat-file storage (`server/db/leads.json`, `content.json`) has race conditions on concurrent writes:

```javascript
// BAD: read-modify-write is not atomic
const leads = JSON.parse(fs.readFileSync('leads.json'));
leads.push(newLead);
fs.writeFileSync('leads.json', JSON.stringify(leads)); // Race condition if two requests hit simultaneously

// BETTER: use atomic write with temp file swap
const fs = require('fs');
const path = require('path');

function atomicWriteJson(filePath, data) {
  const tmpPath = filePath + '.tmp.' + Date.now();
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
  fs.renameSync(tmpPath, filePath); // rename is atomic on the same filesystem
}
```

**Long-term fix:** Migrate to a proper database (SQLite with better-sqlite3, Supabase, PlanetScale, etc.).

## XSS Prevention

Sanitize any user-supplied content before rendering it in HTML:

```javascript
const sanitizeHtml = require('sanitize-html');

// BAD: render raw user input
res.send(`<p>${req.body.comment}</p>`);

// GOOD: sanitize first
res.send(`<p>${sanitizeHtml(req.body.comment, { allowedTags: [] })}</p>`);
```

Express + EJS/Pug typically auto-escape. Vanilla JS `innerHTML = userInput` does not.
