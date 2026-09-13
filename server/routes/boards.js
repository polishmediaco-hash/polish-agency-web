const express = require('express');
const fs = require('fs');
const path = require('path');
const { requireUserOrAdminAuth } = require('../middleware/auth');
const { boardsService } = require('../services/supabase');

const router = express.Router();

const BUNDLED_BOARDS_DIR = path.join(__dirname, '../db/boards');
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
const BOARDS_DIR = IS_VERCEL
  ? path.join('/tmp', 'boards')
  : BUNDLED_BOARDS_DIR;

// Ensure directory exists and seed bundled boards
function ensureBoardsSeeded() {
  try {
    if (!fs.existsSync(BOARDS_DIR)) {
      fs.mkdirSync(BOARDS_DIR, { recursive: true });
    }
    if (fs.existsSync(BUNDLED_BOARDS_DIR) && BOARDS_DIR !== BUNDLED_BOARDS_DIR) {
      const bundled = fs.readdirSync(BUNDLED_BOARDS_DIR).filter(f => f.endsWith('.json'));
      for (const f of bundled) {
        const dest = path.join(BOARDS_DIR, f);
        if (!fs.existsSync(dest)) {
          fs.copyFileSync(path.join(BUNDLED_BOARDS_DIR, f), dest);
        }
      }
    }
  } catch (err) {
    console.warn('[Boards] Seeding warning:', err.message);
  }
}
ensureBoardsSeeded();

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
router.get('/', async (req, res) => {
  try {
    let allBoards = await boardsService.listBoards();

    // If no boards exist, seed starter template
    if (!allBoards || allBoards.length === 0) {
      const starter = getStarterBoard();
      await boardsService.saveBoard(starter);
      allBoards = [starter];
    }

    const boards = allBoards
      .map(board => {
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
router.post('/', requireUserOrAdminAuth, async (req, res) => {
  try {
    const { title, client, template } = req.body || {};

    const id = `board-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    let newBoard;

    if (template === 'starter' || template === 'executive') {
      newBoard = getStarterBoard();
      newBoard.id = id;
      newBoard.slug = id;
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
            serifAccent: '',
            description: '',
            boxes: [
              {
                tag: 'PHASE 01',
                tagColor: 'gold',
                title: 'Primary Strategic Objective',
                content: 'Core objective and methodology for this client engagement.'
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
            content: 'Client strategy priorities and actionable milestones.',
            footer: 'POLISH STUDIO'
          }
        ],
        connections: []
      };
    }

    if (req.user) {
      newBoard.ownerId = req.user.uid || 'admin';
      newBoard.ownerEmail = req.user.email || '';
    }

    const saved = await boardsService.saveBoard(newBoard);
    if (!saved) {
      return res.status(500).json({ success: false, error: 'Failed to save board.' });
    }

    res.status(201).json({ success: true, message: 'Board created successfully.', board: saved });
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

// Helper: Resolve a board file path by ID or slug (Local fallback)
function resolveBoardPath(safeId) {
  let filePath = path.join(BOARDS_DIR, `${safeId}.json`);

  // Also support finding by slug
  if (!fs.existsSync(filePath)) {
    const files = fs.readdirSync(BOARDS_DIR).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const b = readBoardFile(path.join(BOARDS_DIR, file));
      if (b && (b.slug === safeId || b.id === safeId)) {
        return path.join(BOARDS_DIR, file);
      }
    }
  }

  if (!fs.existsSync(filePath)) {
    if (safeId === 'starter-strategy-board' || safeId === 'executive-strategy-template') {
      const starter = getStarterBoard();
      writeBoardFile(path.join(BOARDS_DIR, `${starter.id}.json`), starter);
      return path.join(BOARDS_DIR, `${starter.id}.json`);
    }

    // Fallback check in bundled boards
    const bundledPath = path.join(BUNDLED_BOARDS_DIR, `${safeId}.json`);
    if (fs.existsSync(bundledPath)) {
      const bundledBoard = readBoardFile(bundledPath);
      if (bundledBoard) {
        writeBoardFile(path.join(BOARDS_DIR, `${safeId}.json`), bundledBoard);
        return path.join(BOARDS_DIR, `${safeId}.json`);
      }
    }
    return null;
  }

  return filePath;
}

// GET /api/boards/:id (Get single board data)
router.get('/:id', async (req, res) => {
  try {
    const safeId = sanitizeBoardId(req.params.id);
    if (!safeId) {
      return res.status(400).json({ success: false, error: 'Invalid board identifier.' });
    }

    let board = await boardsService.getBoardById(safeId);
    if (!board) {
      if (safeId === 'starter-strategy-board' || safeId === 'executive-strategy-template') {
        board = getStarterBoard();
        await boardsService.saveBoard(board);
      } else {
        return res.status(404).json({ success: false, error: 'Board not found.' });
      }
    }

    res.json({ success: true, board });
  } catch (err) {
    console.error('Error loading board:', err);
    res.status(500).json({ success: false, error: 'Could not load board.' });
  }
});

// GET /api/boards/:id/comments (Get all comments for a board)
router.get('/:id/comments', async (req, res) => {
  try {
    const safeId = sanitizeBoardId(req.params.id);
    if (!safeId) {
      return res.status(400).json({ success: false, error: 'Invalid board identifier.' });
    }

    const board = await boardsService.getBoardById(safeId);
    if (!board) {
      return res.status(404).json({ success: false, error: 'Board not found.' });
    }

    const comments = Array.isArray(board.comments) ? board.comments : [];
    res.json({ success: true, count: comments.length, comments });
  } catch (err) {
    console.error('Error fetching board comments:', err);
    res.status(500).json({ success: false, error: 'Could not load comments.' });
  }
});

// POST /api/boards/:id/comments (Add, update, or resolve a comment)
router.post('/:id/comments', async (req, res) => {
  try {
    const safeId = sanitizeBoardId(req.params.id);
    if (!safeId) {
      return res.status(400).json({ success: false, error: 'Invalid board identifier.' });
    }

    const board = await boardsService.getBoardById(safeId);
    if (!board) {
      return res.status(404).json({ success: false, error: 'Board not found.' });
    }

    if (!Array.isArray(board.comments)) {
      board.comments = [];
    }

    const payload = req.body || {};

    // Support deletion action
    if (payload.action === 'delete' && payload.commentId) {
      board.comments = board.comments.filter(c => c.id !== payload.commentId);
      await boardsService.saveBoard(board);
      return res.json({
        success: true,
        message: 'Comment deleted.',
        count: board.comments.length,
        comments: board.comments
      });
    }

    // Support batch replace if passed an array of comments
    if (Array.isArray(payload.comments)) {
      board.comments = payload.comments;
      await boardsService.saveBoard(board);
      return res.json({
        success: true,
        message: 'Comments updated.',
        count: board.comments.length,
        comments: board.comments
      });
    }

    // Single comment add or update
    const commentData = payload.comment || payload;
    const commentId = commentData.id || `pin-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Find existing comment index
    const existingIndex = board.comments.findIndex(c => c.id === commentId);

    // Compute pin number
    let pinNumber = Number(commentData.number);
    if (!pinNumber || isNaN(pinNumber)) {
      if (existingIndex >= 0 && board.comments[existingIndex].number) {
        pinNumber = board.comments[existingIndex].number;
      } else {
        pinNumber = board.comments.length + 1;
      }
    }

    const newComment = {
      id: commentId,
      x: typeof commentData.x === 'number' ? commentData.x : 100,
      y: typeof commentData.y === 'number' ? commentData.y : 100,
      number: pinNumber,
      type: commentData.type === 'approval' ? 'approval' : 'feedback',
      author: String(commentData.author || 'Client').trim().slice(0, 100),
      content: String(commentData.content || commentData.text || '').trim().slice(0, 3000),
      resolved: Boolean(commentData.resolved),
      createdAt: (existingIndex >= 0 && board.comments[existingIndex].createdAt) || commentData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: Array.isArray(commentData.replies)
        ? commentData.replies.slice(0, 50)
        : (existingIndex >= 0 ? (board.comments[existingIndex].replies || []) : [])
    };

    // If a reply was sent
    if (payload.action === 'reply' && payload.reply) {
      const replyObj = {
        id: `reply-${Date.now().toString(36)}`,
        author: String(payload.reply.author || 'Advisor').trim().slice(0, 100),
        content: String(payload.reply.content || payload.reply.text || '').trim().slice(0, 1000),
        createdAt: new Date().toISOString()
      };
      if (existingIndex >= 0) {
        board.comments[existingIndex].replies = board.comments[existingIndex].replies || [];
        board.comments[existingIndex].replies.push(replyObj);
        newComment.replies = board.comments[existingIndex].replies;
      }
    }

    if (existingIndex >= 0) {
      board.comments[existingIndex] = { ...board.comments[existingIndex], ...newComment };
    } else {
      board.comments.push(newComment);
    }

    await boardsService.saveBoard(board);

    res.json({
      success: true,
      message: existingIndex >= 0 ? 'Comment updated.' : 'Comment dropped.',
      count: board.comments.length,
      comment: existingIndex >= 0 ? board.comments[existingIndex] : newComment,
      comments: board.comments
    });
  } catch (err) {
    console.error('Error saving board comment:', err);
    res.status(500).json({ success: false, error: 'Could not save comment.' });
  }
});

// PUT /api/boards/:id (Save/Update board data)
router.put('/:id', requireUserOrAdminAuth, async (req, res) => {
  try {
    const safeId = sanitizeBoardId(req.params.id);
    if (!safeId) {
      return res.status(400).json({ success: false, error: 'Invalid board identifier.' });
    }
    const incomingData = req.body;

    if (!incomingData || typeof incomingData !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid board payload.' });
    }

    incomingData.id = safeId;
    if (req.user) {
      incomingData.ownerId = req.user.uid || incomingData.ownerId;
      incomingData.ownerEmail = req.user.email || incomingData.ownerEmail;
    }

    const saved = await boardsService.saveBoard(incomingData);
    if (!saved) {
      return res.status(500).json({ success: false, error: 'Failed to save board.' });
    }

    res.json({ success: true, message: 'Board saved.', updatedAt: saved.updatedAt || new Date().toISOString() });
  } catch (err) {
    console.error('Error saving board:', err);
    res.status(500).json({ success: false, error: 'Could not save board.' });
  }
});

// POST /api/boards/:id/duplicate (Duplicate a board)
router.post('/:id/duplicate', requireUserOrAdminAuth, async (req, res) => {
  try {
    const safeId = sanitizeBoardId(req.params.id);
    if (!safeId) {
      return res.status(400).json({ success: false, error: 'Invalid board identifier.' });
    }

    const original = await boardsService.getBoardById(safeId);
    if (!original) {
      return res.status(404).json({ success: false, error: 'Original board not found.' });
    }

    const newId = `board-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const copy = {
      ...original,
      id: newId,
      slug: newId,
      title: `${original.title || 'Board'} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (req.user) {
      copy.ownerId = req.user.uid || 'admin';
      copy.ownerEmail = req.user.email || '';
    }

    const saved = await boardsService.saveBoard(copy);
    res.json({ success: true, message: 'Board duplicated successfully.', board: saved });
  } catch (err) {
    console.error('Error duplicating board:', err);
    res.status(500).json({ success: false, error: 'Could not duplicate board.' });
  }
});

// DELETE /api/boards/:id (Delete a board)
router.delete('/:id', requireUserOrAdminAuth, async (req, res) => {
  try {
    const safeId = sanitizeBoardId(req.params.id);
    if (!safeId) {
      return res.status(400).json({ success: false, error: 'Invalid board identifier.' });
    }

    const deleted = await boardsService.deleteBoard(safeId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Board not found.' });
    }

    res.json({ success: true, message: 'Board deleted successfully.' });
  } catch (err) {
    console.error('Error deleting board:', err);
    res.status(500).json({ success: false, error: 'Could not delete board.' });
  }
});

module.exports = router;
