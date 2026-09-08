/**
 * POLISH Board Studio — Central State, History & Orchestration
 */

window.StudioCore = (function () {
  let currentBoard = null;
  let selectedElement = null;
  let selectedElementData = null;
  let selectedConnection = null;

  let undoStack = [];
  let redoStack = [];

  let saveTimeout = null;
  let canvasContainer = null;

  async function init() {
    canvasContainer = document.getElementById('board-canvas');

    // 1. Determine Board ID from URL
    const params = new URLSearchParams(window.location.search);
    let boardId = params.get('id');

    // Check pathname like /b/:id
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'b' && pathParts[1]) {
      boardId = pathParts[1];
    }

    if (!boardId) {
      // Fetch latest board for current user
      if (window.PolishFirebase && window.PolishFirebase.currentUser) {
        const userBoards = await window.PolishFirebase.listBoards(window.PolishFirebase.currentUser.uid);
        if (userBoards && userBoards.length > 0) {
          boardId = userBoards[0].id;
        }
      }
      if (!boardId) {
        const res = await fetch('/api/boards');
        const data = await res.json();
        if (data.boards && data.boards.length > 0) {
          boardId = data.boards[0].id;
        }
      }
    }

    if (boardId) {
      await loadBoard(boardId);
    }

    // Bind Keyboard Shortcuts
    bindKeyboardShortcuts();
  }

  async function loadBoard(id) {
    try {
      let board = null;
      if (window.PolishFirebase) {
        board = await window.PolishFirebase.getBoard(id);
      }

      if (!board) {
        const res = await fetch(`/api/boards/${encodeURIComponent(id)}`);
        const data = await res.json();
        if (data.success && data.board) {
          board = data.board;
        }
      }

      if (!board) {
        console.error('Failed to load board');
        return;
      }

      currentBoard = board;
      document.getElementById('boardTitleInput').value = currentBoard.title || 'Untitled Board';

      // Update client view button link
      const btnClient = document.getElementById('btnClientView');
      if (btnClient) {
        btnClient.href = `/b/${encodeURIComponent(currentBoard.id)}`;
      }

      // Restore Viewport Transform
      if (currentBoard.viewport && window.CanvasEngine) {
        window.CanvasEngine.setTransform(
          currentBoard.viewport.scale || 0.75,
          currentBoard.viewport.panX || 100,
          currentBoard.viewport.panY || 80
        );
      }

      renderBoard();
      indicateSaved();
    } catch (err) {
      console.error('Error loading board:', err);
    }
  }

  function renderBoard() {
    if (!currentBoard || !canvasContainer) return;

    // Clear existing DOM elements
    canvasContainer.querySelectorAll('.board-frame, .sticky-note, .pricing-card, .form-field-card, .script-bubble').forEach(el => el.remove());

    // Render all elements
    (currentBoard.elements || []).forEach(data => {
      window.ElementsFactory.renderElement(data, canvasContainer);
    });

    // Render all connections
    if (window.ConnectorEngine) {
      window.ConnectorEngine.renderAllConnections(currentBoard.connections || []);
    }
  }

  // Selection Handling
  function selectElement(el, data) {
    deselectAll();
    selectedElement = el;
    selectedElementData = data;
    el.classList.add('is-selected');

    if (window.StudioInspector) {
      window.StudioInspector.show(el, data);
    }
  }

  function selectConnection(conn, pathEl) {
    deselectAll();
    selectedConnection = conn;
    pathEl.classList.add('is-selected');

    const labelPill = document.getElementById(`label-${conn.id}`);
    if (labelPill) labelPill.classList.add('is-selected');

    if (window.StudioInspector && labelPill) {
      window.StudioInspector.show(labelPill, { ...conn, type: 'connection' });
    }
  }

  function deselectAll() {
    if (selectedElement) {
      selectedElement.classList.remove('is-selected');
      selectedElement = null;
      selectedElementData = null;
    }
    if (selectedConnection) {
      document.querySelectorAll('.flow-line.is-selected, .connector-label-pill.is-selected').forEach(el => el.classList.remove('is-selected'));
      selectedConnection = null;
    }
    if (window.StudioInspector) {
      window.StudioInspector.hide();
    }
  }

  // Element Creation from Toolbar
  function addFrame() {
    if (!currentBoard) return;
    const center = getCanvasCenter();
    const count = (currentBoard.elements.filter(e => e.type === 'frame').length + 1).toString().padStart(2, '0');

    const newFrame = {
      id: `frame-${Date.now()}`,
      type: 'frame',
      x: Math.round(center.x - 300),
      y: Math.round(center.y - 240),
      width: 620,
      height: 480,
      zIndex: 10,
      frameNumber: count,
      titlePill: 'STRATEGY MODULE',
      headline: 'New Strategic Container',
      serifAccent: 'Strategic Container',
      description: 'Double-click to customize the strategy and pillars of this frame.',
      boxes: [
        {
          tag: 'CORE LEVER',
          tagColor: 'gold',
          title: 'Section Objective',
          content: 'Add high-impact points and rationale here...'
        }
      ]
    };

    pushHistory();
    currentBoard.elements.push(newFrame);
    const el = window.ElementsFactory.renderElement(newFrame, canvasContainer);
    selectElement(el, newFrame);
    triggerAutoSave();
  }

  function addSticky(color = 'yellow') {
    if (!currentBoard) return;
    const center = getCanvasCenter();
    const rotation = (Math.random() * 4 - 2).toFixed(1);

    const newSticky = {
      id: `sticky-${Date.now()}`,
      type: 'sticky',
      x: Math.round(center.x - 140),
      y: Math.round(center.y - 100),
      width: 280,
      height: 190,
      zIndex: 25,
      color: color,
      rotation: parseFloat(rotation),
      hasTape: true,
      header: 'TACTICAL NOTE',
      content: 'Write an actionable rule, friction point, or strategic memo...',
      footer: 'REF: POLISH'
    };

    pushHistory();
    currentBoard.elements.push(newSticky);
    const el = window.ElementsFactory.renderElement(newSticky, canvasContainer);
    selectElement(el, newSticky);
    triggerAutoSave();
  }

  function addPricing() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const newPricing = {
      id: `pricing-${Date.now()}`,
      type: 'pricing',
      x: Math.round(center.x - 160),
      y: Math.round(center.y - 200),
      width: 320,
      height: 420,
      zIndex: 15,
      badge: 'HIGH-TICKET OFFER',
      currency: 'AED',
      figure: '6,500',
      period: 'Monthly Retainer',
      features: [
        '4 × 60-Min Strategy Calibrations',
        'VIP WhatsApp Async Voice Support',
        'Complete Execution Roadmap',
        'Confidential Executive Advisory'
      ]
    };

    pushHistory();
    currentBoard.elements.push(newPricing);
    const el = window.ElementsFactory.renderElement(newPricing, canvasContainer);
    selectElement(el, newPricing);
    triggerAutoSave();
  }

  function addForm() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const newForm = {
      id: `form-${Date.now()}`,
      type: 'form',
      x: Math.round(center.x - 230),
      y: Math.round(center.y - 150),
      width: 460,
      zIndex: 12,
      title: 'Brand Diagnostic Worksheet',
      badge: 'INTAKE ENGINE',
      desc: 'High-ticket partnership intake & strategic diagnostic parameters.',
      fields: [
        {
          id: `field-${Date.now()}-1`,
          type: 'textarea',
          label: '01. Diagnostic Friction Point',
          badge: 'CALIBRATION',
          instructions: 'Describe the bottleneck in retention, conversion, or media CAC:',
          value: ''
        },
        {
          id: `field-${Date.now()}-2`,
          type: 'input',
          label: '02. Target 90-Day Revenue Benchmark (AED / $)',
          badge: 'METRIC',
          instructions: 'Current baseline vs target milestone:',
          value: ''
        }
      ]
    };

    pushHistory();
    currentBoard.elements.push(newForm);
    const el = window.ElementsFactory.renderElement(newForm, canvasContainer);
    selectElement(el, newForm);
    triggerAutoSave();
  }

  function addScript() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const newScript = {
      id: `script-${Date.now()}`,
      type: 'script',
      x: Math.round(center.x - 160),
      y: Math.round(center.y - 80),
      width: 320,
      height: 140,
      zIndex: 14,
      content: '"Verbatim client advisory script or closing talk track..."'
    };

    pushHistory();
    currentBoard.elements.push(newScript);
    const el = window.ElementsFactory.renderElement(newScript, canvasContainer);
    selectElement(el, newScript);
    triggerAutoSave();
  }

  function addConnection(conn) {
    if (!currentBoard) return;
    pushHistory();
    if (!currentBoard.connections) currentBoard.connections = [];
    currentBoard.connections.push(conn);
    if (window.ConnectorEngine) {
      window.ConnectorEngine.renderAllConnections(currentBoard.connections);
    }
    triggerAutoSave();
  }

  // Duplicate Selected Element
  function duplicateSelected() {
    if (!selectedElementData || !currentBoard) return;
    pushHistory();

    const clone = JSON.parse(JSON.stringify(selectedElementData));
    clone.id = `${clone.type}-${Date.now()}`;
    clone.x += 40;
    clone.y += 40;

    currentBoard.elements.push(clone);
    const el = window.ElementsFactory.renderElement(clone, canvasContainer);
    selectElement(el, clone);
    triggerAutoSave();
  }

  // Delete Selected Element
  function deleteSelected() {
    if (!currentBoard) return;

    if (selectedElement && selectedElementData) {
      pushHistory();
      const id = selectedElementData.id;
      currentBoard.elements = currentBoard.elements.filter(e => e.id !== id);
      if (currentBoard.connections) {
        currentBoard.connections = currentBoard.connections.filter(c => c.from !== id && c.to !== id);
      }
      selectedElement.remove();
      deselectAll();
      if (window.ConnectorEngine) window.ConnectorEngine.renderAllConnections(currentBoard.connections || []);
      triggerAutoSave();
    } else if (selectedConnection) {
      pushHistory();
      const connId = selectedConnection.id;
      currentBoard.connections = currentBoard.connections.filter(c => c.id !== connId);
      deselectAll();
      if (window.ConnectorEngine) window.ConnectorEngine.renderAllConnections(currentBoard.connections || []);
      triggerAutoSave();
    }
  }

  function getCanvasCenter() {
    if (window.CanvasEngine) {
      return window.CanvasEngine.screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
    }
    return { x: 500, y: 300 };
  }

  // Auto-Save Debouncer
  function triggerAutoSave() {
    indicateSaving();
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      await persistBoard();
    }, 1200);
  }

  async function persistBoard() {
    if (!currentBoard) return;

    if (window.CanvasEngine) {
      const pan = window.CanvasEngine.getPan();
      currentBoard.viewport = {
        panX: pan.x,
        panY: pan.y,
        scale: window.CanvasEngine.getScale()
      };
    }

    try {
      if (window.PolishFirebase) {
        await window.PolishFirebase.saveBoard(currentBoard, window.PolishFirebase.currentUser);
        indicateSaved();
      } else {
        const res = await fetch(`/api/boards/${encodeURIComponent(currentBoard.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentBoard)
        });
        const data = await res.json();
        if (data.success) {
          indicateSaved();
        }
      }
    } catch (err) {
      console.error('Error saving board:', err);
    }
  }

  function indicateSaving() {
    const el = document.getElementById('saveIndicator');
    if (el) el.innerHTML = '<span class="save-dot" style="background:#F59E0B"></span> Saving...';
  }

  function indicateSaved() {
    const el = document.getElementById('saveIndicator');
    if (el) el.innerHTML = '<span class="save-dot" style="background:#10B981"></span> Saved to Cloud';
  }

  // History (Undo / Redo)
  function pushHistory() {
    if (!currentBoard) return;
    undoStack.push(JSON.stringify(currentBoard));
    if (undoStack.length > 30) undoStack.shift();
    redoStack = [];
  }

  function undo() {
    if (undoStack.length === 0) return;
    redoStack.push(JSON.stringify(currentBoard));
    const previous = JSON.parse(undoStack.pop());
    currentBoard = previous;
    renderBoard();
    triggerAutoSave();
  }

  function redo() {
    if (redoStack.length === 0) return;
    undoStack.push(JSON.stringify(currentBoard));
    const next = JSON.parse(redoStack.pop());
    currentBoard = next;
    renderBoard();
    triggerAutoSave();
  }

  function bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      // Cmd+Z (Undo) / Cmd+Shift+Z (Redo)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) redo();
        else undo();
        e.preventDefault();
      }

      // Cmd+D (Duplicate)
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        duplicateSelected();
        e.preventDefault();
      }

      // Delete / Backspace
      if (e.key === 'Backspace' || e.key === 'Delete') {
        deleteSelected();
        e.preventDefault();
      }

      // Escape (Deselect)
      if (e.key === 'Escape') {
        deselectAll();
      }
    });

    // Board Title Input Sync
    const titleInput = document.getElementById('boardTitleInput');
    if (titleInput) {
      titleInput.addEventListener('input', () => {
        if (currentBoard) {
          currentBoard.title = titleInput.value;
          triggerAutoSave();
        }
      });
    }
  }

  function addTable() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const newTable = {
      id: `table-${Date.now()}`,
      type: 'table',
      x: Math.round(center.x - 280),
      y: Math.round(center.y - 150),
      width: 560,
      zIndex: 12,
      title: 'Strategic Deliverables Matrix',
      badge: 'EXECUTION PLAN',
      headers: ['Strategic Phase', 'Target Output', 'Timeline & RoI'],
      rows: [
        ['01. Diagnostic Sprint', 'Friction Audit & Action Blueprint', 'Week 1–2'],
        ['02. Executive Advisory', 'Weekly Calibrations + Async Voice', 'Months 1–3'],
        ['03. Scale & Governance', 'Autonomous Team Protocols', 'Ongoing']
      ]
    };

    pushHistory();
    currentBoard.elements.push(newTable);
    const el = window.ElementsFactory.renderElement(newTable, canvasContainer);
    selectElement(el, newTable);
    triggerAutoSave();
  }

  function findElement(id) {
    return currentBoard ? currentBoard.elements.find(e => e.id === id) : null;
  }

  function findConnection(id) {
    return currentBoard ? currentBoard.connections.find(c => c.id === id) : null;
  }

  function reRenderElement(id) {
    const data = findElement(id);
    const oldEl = document.getElementById(id);
    if (data && oldEl) {
      oldEl.remove();
      const newEl = window.ElementsFactory.renderElement(data, canvasContainer);
      selectElement(newEl, data);
      if (window.ConnectorEngine && currentBoard) {
        window.ConnectorEngine.renderAllConnections(currentBoard.connections || []);
      }
    }
  }

  function addTableRow(id) {
    const data = findElement(id);
    if (data && data.rows) {
      pushHistory();
      const colCount = (data.headers && data.headers.length) || 3;
      const newRow = Array(colCount).fill('Editable detail...');
      data.rows.push(newRow);
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function removeTableRow(id) {
    const data = findElement(id);
    if (data && data.rows && data.rows.length > 1) {
      pushHistory();
      data.rows.pop();
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function addTableCol(id) {
    const data = findElement(id);
    if (data) {
      pushHistory();
      if (!data.headers) data.headers = [];
      data.headers.push(`Column ${data.headers.length + 1}`);
      if (data.rows) {
        data.rows.forEach(r => r.push('Detail...'));
      }
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function removeTableCol(id) {
    const data = findElement(id);
    if (data && data.headers && data.headers.length > 1) {
      pushHistory();
      data.headers.pop();
      if (data.rows) {
        data.rows.forEach(r => {
          if (r.length > 1) r.pop();
        });
      }
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function addFormField(id, type = 'textarea') {
    const data = findElement(id);
    if (data) {
      pushHistory();
      if (!data.fields) data.fields = [];
      const num = data.fields.length + 1;
      data.fields.push({
        id: `field-${Date.now()}`,
        type: type,
        label: `0${num}. Diagnostic Item / Question`,
        badge: type === 'input' ? 'SHORT' : 'DEEP',
        instructions: type === 'input' ? 'Single parameter or metric target:' : 'Client calibration and analysis details:',
        value: ''
      });
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function removeFormField(id, index) {
    const data = findElement(id);
    if (data && data.fields && data.fields.length > 0) {
      pushHistory();
      data.fields.splice(index, 1);
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function addPricingFeature(id) {
    const data = findElement(id);
    if (data) {
      pushHistory();
      if (!data.features) data.features = [];
      data.features.push('High-touch advisory deliverable...');
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function removePricingFeature(id, index) {
    const data = findElement(id);
    if (data && data.features && data.features.length > 0) {
      pushHistory();
      data.features.splice(index, 1);
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function addFrameBox(id) {
    const data = findElement(id);
    if (data) {
      pushHistory();
      if (!data.boxes) data.boxes = [];
      data.boxes.push({
        tag: 'STRATEGY',
        tagColor: 'gold',
        title: 'Tactical Pillar',
        content: 'Define execution protocols, ownership, and deliverables...'
      });
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function removeFrameBox(id, index) {
    const data = findElement(id);
    if (data && data.boxes && data.boxes.length > 0) {
      pushHistory();
      data.boxes.splice(index, 1);
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function exportJSON() {
    if (!currentBoard) return;
    const blob = new Blob([JSON.stringify(currentBoard, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBoard.title ? currentBoard.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'board'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return {
    init,
    selectElement,
    selectConnection,
    deselectAll,
    addFrame,
    addFrameBox,
    removeFrameBox,
    addSticky,
    addPricing,
    addPricingFeature,
    removePricingFeature,
    addTable,
    addTableRow,
    removeTableRow,
    addTableCol,
    removeTableCol,
    addForm,
    addFormField,
    removeFormField,
    addScript,
    addConnection,
    duplicateSelected,
    deleteSelected,
    triggerAutoSave,
    undo,
    redo,
    exportJSON,
    getConnections: () => (currentBoard ? currentBoard.connections || [] : []),
    findElement,
    findConnection,
    reRenderElement,
    getCurrentBoardId: () => (currentBoard ? currentBoard.id : null)
  };
})();
