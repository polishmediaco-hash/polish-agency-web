const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
const BOARDS_DIR = IS_VERCEL
  ? path.join('/tmp', 'boards')
  : path.join(__dirname, '../db/boards');

// Ensure directory exists
if (!fs.existsSync(BOARDS_DIR)) {
  fs.mkdirSync(BOARDS_DIR, { recursive: true });
}

// Helper: Get starter board template
function getStarterBoard() {
  return {
    id: 'starter-strategy-board',
    slug: 'executive-strategy-template',
    title: 'Executive Strategy Blueprint',
    client: 'Private Advisory Client',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewport: {
      panX: 80,
      panY: 60,
      scale: 0.72
    },
    elements: [
      {
        id: 'frame-foundation',
        type: 'frame',
        x: 100,
        y: 120,
        width: 640,
        height: 520,
        zIndex: 10,
        frameNumber: '01',
        titlePill: 'EXECUTIVE FOUNDATION',
        headline: 'Positioning & Strategic Reality',
        serifAccent: 'Strategic Reality',
        description: 'Establishing elite category authority and pricing power before entering the market.',
        boxes: [
          {
            tag: 'CORE INSIGHT',
            tagColor: 'gold',
            title: 'Discreet Boutique Authority',
            content: 'High-net-worth clients seek trusted confidential advisors. Direct high-context conversations outperform passive social views.'
          },
          {
            tag: 'THE BARRIER',
            tagColor: 'rose',
            title: 'Eliminating Low-Ticket Fatigue',
            content: 'Eliminating hourly sessions in favor of structured high-ticket advisory containers that preserve executive peace.'
          }
        ]
      },
      {
        id: 'frame-offer',
        type: 'frame',
        x: 840,
        y: 120,
        width: 680,
        height: 580,
        zIndex: 10,
        frameNumber: '02',
        titlePill: 'HAUTE OFFER LADDER',
        headline: 'Two-Tier Retainer Architecture',
        serifAccent: 'Retainer Architecture',
        description: 'A structured conversion bridge converting friction into ongoing partnership retainers.',
        boxes: [
          {
            tag: 'TIER 1 • DIAGNOSTIC',
            tagColor: 'blue',
            title: 'The 60-Min Life Friction Audit',
            content: 'One-time diagnostic mapping pace fatigue, decision paralysis, and boundary erosion. Delivers a custom 1-page blueprint.'
          },
          {
            tag: 'TIER 2 • CORE RETAINER',
            tagColor: 'green',
            title: '30-Day Executive Reset Container',
            content: 'Weekly private calibrations in-person or Zoom + VIP async WhatsApp audio notes access. Roster capped at 5 active clients.'
          }
        ]
      },
      {
        id: 'sticky-1',
        type: 'sticky',
        x: 770,
        y: 40,
        width: 260,
        height: 180,
        zIndex: 25,
        color: 'yellow',
        rotation: -2,
        hasTape: true,
        header: 'STRATEGIC NOTE',
        content: 'Never pitch retainers cold. The Tier 1 diagnostic audit filters out non-serious leads and converts at 60%+ into Tier 2.',
        footer: 'REF: POLISH-PROTO'
      },
      {
        id: 'sticky-2',
        type: 'sticky',
        x: 1540,
        y: 260,
        width: 260,
        height: 180,
        zIndex: 25,
        color: 'rose',
        rotation: 1.5,
        hasTape: true,
        header: 'EXECUTION RULE',
        content: 'Cap roster strictly at 5–6 clients to maintain impeccable aura, bespoke focus, and uncompromising pricing leverage.',
        footer: 'REF: POLISH-LADDER'
      },
      {
        id: 'pricing-1',
        type: 'pricing',
        x: 840,
        y: 740,
        width: 320,
        height: 420,
        zIndex: 15,
        badge: 'ENTRY DIAGNOSTIC',
        currency: 'AED',
        figure: '1,200',
        period: 'One-Time Diagnostic',
        features: [
          '60-Min Comprehensive Friction Audit',
          'Pace & Decision Energy Mapping',
          '1-Page Bespoke Action Blueprint',
          '60% Direct Conversion to Tier 2'
        ]
      },
      {
        id: 'pricing-2',
        type: 'pricing',
        x: 1200,
        y: 740,
        width: 320,
        height: 420,
        zIndex: 15,
        isFeatured: true,
        badge: 'SIGNATURE CONTAINER',
        currency: 'AED',
        figure: '6,500',
        period: 'Monthly Retainer',
        features: [
          '4 × 60-Min In-Person or Zoom Sessions',
          'Mon–Fri VIP WhatsApp Voice Advisory',
          'Confidential Executive Decision Clearing',
          'Corporate Expensability Framework'
        ]
      },
      {
        id: 'table-1',
        type: 'table',
        x: 1580,
        y: 740,
        width: 580,
        zIndex: 12,
        title: 'Strategic Deliverables & Milestones Matrix',
        badge: 'EXECUTION PLAN',
        headers: ['Strategic Phase', 'Target Output', 'Timeline & RoI'],
        rows: [
          ['01. Diagnostic Sprint', 'Friction Audit & Bespoke Blueprint', 'Week 1–2'],
          ['02. Executive Advisory', 'Weekly Calibrations + Async Voice Notes', 'Months 1–3'],
          ['03. Scale & Governance', 'Autonomous Team Protocols & Retention', 'Ongoing']
        ]
      }
    ],
    connections: [
      {
        id: 'conn-1',
        from: 'frame-foundation',
        fromAnchor: 'right',
        to: 'frame-offer',
        toAnchor: 'left',
        style: 'dashed',
        color: 'slate',
        label: '1. Foundation Positioning → Informs Haute Offer'
      },
      {
        id: 'conn-2',
        from: 'frame-offer',
        fromAnchor: 'bottom',
        to: 'pricing-1',
        toAnchor: 'top',
        style: 'dashed',
        color: 'gold',
        label: '2. Offer Packaged into 2-Tier Pricing'
      },
      {
        id: 'conn-3',
        from: 'pricing-2',
        fromAnchor: 'right',
        to: 'table-1',
        toAnchor: 'left',
        style: 'dashed',
        color: 'noir',
        label: '3. Retainer Mapped to Deliverables Matrix'
      }
    ]
  };
}

// Helper: Read a single board file safely
function readBoardFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading board file ${filePath}:`, err.message);
    return null;
  }
}

// Helper: Write a single board file atomically
function writeBoardFile(filePath, data) {
  try {
    data.updatedAt = new Date().toISOString();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = filePath + '.tmp.' + Date.now();
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
    return true;
  } catch (err) {
    console.error(`Error writing board file ${filePath}:`, err.message);
    return false;
  }
}

// GET /api/boards (List all boards)
router.get('/', (req, res) => {
  try {
    const files = fs.readdirSync(BOARDS_DIR).filter(f => f.endsWith('.json'));

    // If no boards exist, seed starter template
    if (files.length === 0) {
      const starter = getStarterBoard();
      const starterPath = path.join(BOARDS_DIR, `${starter.id}.json`);
      writeBoardFile(starterPath, starter);
      files.push(`${starter.id}.json`);
    }

    const boards = files
      .map(file => {
        const board = readBoardFile(path.join(BOARDS_DIR, file));
        if (!board) return null;
        return {
          id: board.id,
          slug: board.slug || board.id,
          title: board.title || 'Untitled Board',
          client: board.client || 'Private Client',
          createdAt: board.createdAt || new Date().toISOString(),
          updatedAt: board.updatedAt || new Date().toISOString(),
          elementCount: (board.elements || []).length,
          connectionCount: (board.connections || []).length
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({ success: true, count: boards.length, boards });
  } catch (err) {
    console.error('Error listing boards:', err);
    res.status(500).json({ success: false, error: 'Could not list boards.' });
  }
});

// POST /api/boards (Create new board)
router.post('/', (req, res) => {
  try {
    const { title, client, template } = req.body || {};

    const id = `board-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    let newBoard;

    if (template === 'starter' || template === 'executive') {
      newBoard = getStarterBoard();
      newBoard.id = id;
      newBoard.title = (title || 'Executive Strategy Board').trim();
      newBoard.client = (client || 'Private Client').trim();
    } else {
      // Blank Canvas Board
      newBoard = {
        id,
        slug: id,
        title: (title || 'Untitled Board').trim(),
        client: (client || 'Private Client').trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewport: {
          panX: 100,
          panY: 80,
          scale: 0.8
        },
        elements: [
          {
            id: 'frame-1',
            type: 'frame',
            x: 120,
            y: 120,
            width: 600,
            height: 480,
            zIndex: 10,
            frameNumber: '01',
            titlePill: 'FOUNDATION',
            headline: 'Strategic Overview',
            serifAccent: 'Strategic Overview',
            description: 'Double-click any text on this board to begin editing.',
            boxes: [
              {
                tag: 'PHASE 01',
                tagColor: 'gold',
                title: 'Primary Strategic Objective',
                content: 'Describe the core objective and methodology for this client container.'
              }
            ]
          },
          {
            id: 'sticky-1',
            type: 'sticky',
            x: 760,
            y: 140,
            width: 260,
            height: 180,
            zIndex: 20,
            color: 'yellow',
            rotation: -1.5,
            hasTape: true,
            header: 'FIRST NOTE',
            content: 'Drag frames, sticky notes, and connecting arrows from the left palette to build your board.',
            footer: 'POLISH STUDIO'
          }
        ],
        connections: []
      };
    }

    const filePath = path.join(BOARDS_DIR, `${id}.json`);
    const saved = writeBoardFile(filePath, newBoard);

    if (!saved) {
      return res.status(500).json({ success: false, error: 'Failed to write board file.' });
    }

    res.status(201).json({ success: true, message: 'Board created successfully.', board: newBoard });
  } catch (err) {
    console.error('Error creating board:', err);
    res.status(500).json({ success: false, error: 'Could not create board.' });
  }
});

// Helper: Validate and sanitize board identifier against path traversal attacks
function sanitizeBoardId(id) {
  if (!id || typeof id !== 'string') return null;
  const clean = path.basename(id).trim();
  if (!/^[a-zA-Z0-9_-]{2,80}$/.test(clean)) return null;
  return clean;
}

// GET /api/boards/:id (Get single board data)
router.get('/:id', (req, res) => {
  try {
    const safeId = sanitizeBoardId(req.params.id);
    if (!safeId) {
      return res.status(400).json({ success: false, error: 'Invalid board identifier.' });
    }

    let filePath = path.join(BOARDS_DIR, `${safeId}.json`);

    // Also support finding by slug
    if (!fs.existsSync(filePath)) {
      const files = fs.readdirSync(BOARDS_DIR).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const b = readBoardFile(path.join(BOARDS_DIR, file));
        if (b && (b.slug === safeId || b.id === safeId)) {
          filePath = path.join(BOARDS_DIR, file);
          break;
        }
      }
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Board not found.' });
    }

    const board = readBoardFile(filePath);
    res.json({ success: true, board });
  } catch (err) {
    console.error('Error loading board:', err);
    res.status(500).json({ success: false, error: 'Could not load board.' });
  }
});

// PUT /api/boards/:id (Save/Update board data)
router.put('/:id', (req, res) => {
  try {
    const safeId = sanitizeBoardId(req.params.id);
    if (!safeId) {
      return res.status(400).json({ success: false, error: 'Invalid board identifier.' });
    }
    const incomingData = req.body;

    if (!incomingData || typeof incomingData !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid board payload.' });
    }

    const filePath = path.join(BOARDS_DIR, `${safeId}.json`);
    incomingData.id = safeId;
    const saved = writeBoardFile(filePath, incomingData);

    if (!saved) {
      return res.status(500).json({ success: false, error: 'Failed to save board.' });
    }

    res.json({ success: true, message: 'Board saved.', updatedAt: incomingData.updatedAt });
  } catch (err) {
    console.error('Error saving board:', err);
    res.status(500).json({ success: false, error: 'Could not save board.' });
  }
});

// POST /api/boards/:id/duplicate (Duplicate a board)
router.post('/:id/duplicate', (req, res) => {
  try {
    const safeId = sanitizeBoardId(req.params.id);
    if (!safeId) {
      return res.status(400).json({ success: false, error: 'Invalid board identifier.' });
    }
    const srcPath = path.join(BOARDS_DIR, `${safeId}.json`);

    if (!fs.existsSync(srcPath)) {
      return res.status(404).json({ success: false, error: 'Original board not found.' });
    }

    const original = readBoardFile(srcPath);
    const newId = `board-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const copy = {
      ...original,
      id: newId,
      slug: newId,
      title: `${original.title || 'Board'} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newPath = path.join(BOARDS_DIR, `${newId}.json`);
    writeBoardFile(newPath, copy);

    res.json({ success: true, message: 'Board duplicated successfully.', board: copy });
  } catch (err) {
    console.error('Error duplicating board:', err);
    res.status(500).json({ success: false, error: 'Could not duplicate board.' });
  }
});

// DELETE /api/boards/:id (Delete a board)
router.delete('/:id', (req, res) => {
  try {
    const safeId = sanitizeBoardId(req.params.id);
    if (!safeId) {
      return res.status(400).json({ success: false, error: 'Invalid board identifier.' });
    }
    const filePath = path.join(BOARDS_DIR, `${safeId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Board not found.' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Board deleted successfully.' });
  } catch (err) {
    console.error('Error deleting board:', err);
    res.status(500).json({ success: false, error: 'Could not delete board.' });
  }
});

module.exports = router;
