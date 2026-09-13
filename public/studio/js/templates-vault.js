/**
 * POLISH Board Studio — Templates Vault
 * Comprehensive repository of high-ticket strategy, advisory,
 * and growth framework board templates.
 */

window.TemplatesVault = (function () {
  "use strict";

  function getBuiltinStarterBoard() {
    return {
      id: 'starter-strategy-board',
      slug: 'executive-strategy-template',
      title: 'Executive Client Acquisition & Retainer Blueprint',
      client: 'Private Advisory Client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewport: { panX: 60, panY: 60, scale: 0.55 },
      elements: [
        // ==========================================================
        // FRAME 00: EXECUTIVE CONTROL CENTER & SYSTEM LEGEND
        // ==========================================================
        {
          id: 'frame-control-center',
          type: 'frame',
          x: 80,
          y: 100,
          width: 540,
          height: 560,
          zIndex: 10,
          frameNumber: '00',
          titlePill: 'EXECUTIVE CONTROL CENTER',
          headline: 'System Legend &',
          serifAccent: 'Strategic Thesis',
          description: 'High-ticket advisory architecture mapping attention disruption, diagnostic qualification, and client conversion.',
          boxes: [
            {
              tag: 'VISUAL SEMANTICS',
              tagColor: 'gold',
              title: 'Color Coded Flow Logic',
              content: '• Sky Azure: Automated Flows & Tech Stack\n• Haute Gold: Strategic Architecture Pillars\n• Mint Sage: High-Ticket Revenue & Retainers\n• Rose: Friction Bottlenecks Solved'
            },
            {
              tag: 'NORTH STAR KPIS',
              tagColor: 'blue',
              title: '90-Day Conversion Benchmarks',
              content: '• Blended MER: 3.8x+ across ad spend\n• Diagnostic to Retainer CVR: 60%+\n• Client Retainer LTV: AED 18,500/quarter\n• Founder Delivery Time: Under 4 hrs/week'
            }
          ]
        },

        // ==========================================================
        // FRAME 01: PHASE 01 • ACQUISITION & ATTENTION (TOFU)
        // ==========================================================
        {
          id: 'frame-foundation',
          type: 'frame',
          x: 680,
          y: 100,
          width: 660,
          height: 560,
          zIndex: 10,
          frameNumber: '01',
          titlePill: 'PHASE 01 • ATTENTION & TRAFFIC',
          headline: 'Advantage+ & Creator',
          serifAccent: 'Prospecting Engine',
          description: 'Engineering a predictable net-new customer acquisition machine via isolated DCT sandbox campaigns and advertorial bridges.',
          boxes: [
            {
              tag: 'PROSPECTING SANDBOX',
              tagColor: 'gold',
              title: 'Dynamic Creative Testing (DCT)',
              content: '3 video thumbstop variations x 2 body messaging angles tested in isolated sandbox campaigns before graduation to ASC core budget.'
            },
            {
              tag: 'LANDING PAGE LIFT',
              tagColor: 'blue',
              title: 'Dedicated Advertorial Presell',
              content: 'Directing high-intent clicks to editorial advertorials explaining clinical formulation science, lifting conversion velocity by 34%.'
            }
          ]
        },

        // ==========================================================
        // FRAME 02: PHASE 02 • AUTHORITY & DIAGNOSTIC (MOFU)
        // ==========================================================
        {
          id: 'frame-nurture',
          type: 'frame',
          x: 1400,
          y: 100,
          width: 660,
          height: 560,
          zIndex: 10,
          frameNumber: '02',
          titlePill: 'PHASE 02 • AUTHORITY & BELIEF',
          headline: 'Diagnostic Audit &',
          serifAccent: 'Belief Architecture',
          description: 'Filtering non-serious prospects through a 60-min friction audit and asynchronous video proof sequences.',
          boxes: [
            {
              tag: 'TIER 1 • DIAGNOSTIC',
              tagColor: 'blue',
              title: 'The 60-Min Life Friction Audit',
              content: 'One-time diagnostic mapping pace fatigue, decision paralysis, and boundary erosion. Delivers a custom 1-page action blueprint.'
            },
            {
              tag: 'PROOF ASSET',
              tagColor: 'rose',
              title: 'VIP WhatsApp Voice Notes Hotline',
              content: 'Private async voice notes and weekly calibration audio teardowns establishing trusted confidential peer authority.'
            }
          ]
        },

        // ==========================================================
        // FRAME 03: PHASE 03 • CONVERSION & RETAINERS (BOFU)
        // ==========================================================
        {
          id: 'frame-offer',
          type: 'frame',
          x: 2120,
          y: 100,
          width: 660,
          height: 560,
          zIndex: 10,
          frameNumber: '03',
          titlePill: 'PHASE 03 • CONVERSION & RETAINER',
          headline: 'Two-Tier Retainer',
          serifAccent: 'Closing Architecture',
          description: 'Converting qualified diagnostic leads into recurring private advisory contracts capped at 5 active clients.',
          boxes: [
            {
              tag: 'TIER 2 • CORE RETAINER',
              tagColor: 'green',
              title: '30-Day Executive Reset Container',
              content: 'Bi-weekly private calibrations + VIP async WhatsApp access. Replaces low-ticket fatigue with predictable sovereign revenue.'
            },
            {
              tag: 'GOVERNANCE',
              tagColor: 'gold',
              title: 'Boutique Sovereign Protocol',
              content: 'Roster capped strictly at 5 active clients to preserve executive peace, impeccable aura, and uncompromising pricing power.'
            }
          ]
        },

        // ==========================================================
        // RETAINER OFFER CARD
        // ==========================================================
        {
          id: 'pricing-1',
          type: 'pricing',
          x: 2840,
          y: 100,
          width: 360,
          zIndex: 15,
          isFeatured: true,
          badge: 'HAUTE ADVISORY RETAINER',
          currency: 'AED',
          figure: '18,500',
          period: 'Quarterly Private Retainer',
          features: [
            'Bi-weekly In-Person or Private Zoom Calibrations',
            'Direct VIP WhatsApp Async Voice Hotline',
            'End-to-End Retention Architecture Blueprint',
            'Complete Team Protocols & Governance Handover'
          ]
        },

        // ==========================================================
        // STRATEGIC WASHI STICKY NOTES
        // ==========================================================
        {
          id: 'sticky-1',
          type: 'sticky',
          x: 620,
          y: 20,
          width: 250,
          height: 170,
          zIndex: 25,
          color: 'yellow',
          rotation: -2,
          hasTape: true,
          header: 'OPERATING RULE 01',
          content: 'Never pitch retainers cold. The Tier 1 diagnostic audit filters tire-kickers and converts at 60%+ into Tier 2.',
          footer: 'REF: POLISH-PROTO'
        },
        {
          id: 'sticky-2',
          type: 'sticky',
          x: 1340,
          y: 20,
          width: 250,
          height: 170,
          zIndex: 25,
          color: 'rose',
          rotation: 1.5,
          hasTape: true,
          header: 'OPERATING RULE 02',
          content: 'Cap active advisory roster strictly at 5–6 clients to maintain bespoke focus and uncompromising pricing leverage.',
          footer: 'REF: POLISH-LADDER'
        },
        {
          id: 'sticky-3',
          type: 'sticky',
          x: 2060,
          y: 20,
          width: 250,
          height: 170,
          zIndex: 25,
          color: 'blue',
          rotation: -1.5,
          hasTape: true,
          header: 'OPERATING RULE 03',
          content: 'Automate post-intake delivery via VIP audio voice memo within 24 hours of diagnostic completion.',
          footer: 'REF: POLISH-SPEED'
        },

        // ==========================================================
        // INTAKE ENGINE (DIAGNOSTIC WORKSHEET)
        // ==========================================================
        {
          id: 'form-1',
          type: 'form',
          x: 680,
          y: 720,
          width: 660,
          zIndex: 12,
          title: 'Brand Diagnostic Intake Worksheet',
          badge: 'INTAKE ENGINE',
          desc: 'Calibrate core operational friction points prior to executive kickoff sprint.',
          fields: [
            {
              id: 'field-diag-1',
              type: 'textarea',
              label: '01. Primary Conversion / Retention Friction',
              badge: 'DIAGNOSTIC',
              instructions: 'Where is the largest bottleneck between customer acquisition and 90-day repeat LTV?',
              value: 'Ad spend efficiency drops after second purchase; need bespoke high-ticket retention sequence.'
            },
            {
              id: 'field-diag-2',
              type: 'input',
              label: '02. Target 90-Day Gross Revenue Benchmark (AED / $)',
              badge: 'METRIC',
              instructions: 'Current baseline vs Q4 goal:',
              value: 'Current $85k/mo → Target $160k/mo'
            }
          ]
        },

        // ==========================================================
        // DELIVERABLES MATRIX (ROADMAP TABLE)
        // ==========================================================
        {
          id: 'table-1',
          type: 'table',
          x: 1400,
          y: 720,
          width: 780,
          zIndex: 12,
          title: '90-Day Scaling Trajectory & Quarterly Milestones',
          badge: 'EXECUTION ROADMAP',
          headers: ['Phase', 'Focus Area', 'Target Metric', 'Deliverable Output'],
          rows: [
            ['Phase 01: Audit', 'Baseline Diagnostic & Creative Sandbox', '2.8x - 3.2x MER', '3:2:2 DCT Ads + Advertorial Bridge'],
            ['Phase 02: Authority', 'Executive Reset & Advisory Launch', '+60% Diagnostic CVR', 'VIP Retainer & WhatsApp Hotline Setup'],
            ['Phase 03: Scaling', 'Autonomous Governance & Handover', 'Zero Founder Fatigue', 'Full SOP Handover & Protocol Runbook']
          ]
        },

        // ==========================================================
        // THESIS SCRIPT CARD
        // ==========================================================
        {
          id: 'script-1',
          type: 'script',
          x: 2240,
          y: 720,
          width: 480,
          height: 190,
          zIndex: 12,
          content: '"High-ticket category authority is not achieved by shouting louder. It is engineered through diagnostic precision, structured containers, and uncompromising pricing power."'
        }
      ],
      connections: [
        {
          id: 'conn-ctrl-1',
          from: 'frame-control-center',
          fromAnchor: 'right',
          to: 'frame-foundation',
          toAnchor: 'left',
          style: 'solid',
          color: 'gold',
          label: 'Phase 01 Launch'
        },
        {
          id: 'conn-1',
          from: 'frame-foundation',
          fromAnchor: 'right',
          to: 'frame-nurture',
          toAnchor: 'left',
          style: 'dashed',
          color: 'blue',
          label: 'High-Intent Prospecting Traffic'
        },
        {
          id: 'conn-2',
          from: 'frame-nurture',
          fromAnchor: 'right',
          to: 'frame-offer',
          toAnchor: 'left',
          style: 'solid',
          color: 'green',
          label: '60%+ Audit Qualification'
        },
        {
          id: 'conn-3',
          from: 'frame-offer',
          fromAnchor: 'right',
          to: 'pricing-1',
          toAnchor: 'left',
          style: 'solid',
          color: 'gold',
          label: 'Quarterly Retainer Contract'
        },
        {
          id: 'conn-4',
          from: 'frame-foundation',
          fromAnchor: 'bottom',
          to: 'form-1',
          toAnchor: 'top',
          style: 'dashed',
          color: 'slate',
          label: 'Friction Intake Calibration'
        },
        {
          id: 'conn-5',
          from: 'frame-nurture',
          fromAnchor: 'bottom',
          to: 'table-1',
          toAnchor: 'top',
          style: 'dashed',
          color: 'slate',
          label: '90-Day Milestone Execution'
        }
      ]
    };
  }

  function getTemplate(templateKey) {
    let newElements = [];
    let newConnections = [];
    let title = "Untitled Board";

    if (templateKey === 'blank') {
      title = 'Blank Canvas';
      newElements = [];
      newConnections = [];
    } else if (templateKey === 'hormozi-offer' || templateKey === 'hormozi') {
      title = 'Alex Hormozi • $100M Grand Slam Offer & Value Equation Canvas';
      const veId = `ve-hz-${Date.now()}`;
      const stackId = `stack-hz-${Date.now()}`;
      const priceId = `pricing-hz-${Date.now()}`;
      const tblId = `table-hz-${Date.now()}`;
      const metricId = `metric-hz-${Date.now()}`;
      const s1Id = `sticky-hz-1-${Date.now()}`;
      const s2Id = `sticky-hz-2-${Date.now()}`;

      newElements = [
        {
          id: veId,
          type: 'value-equation',
          x: 100,
          y: 120,
          width: 740,
          title: 'The $100M Value Equation',
          scoreBadge: 'SCORE: 98.4 / 100',
          dreamOutcome: { title: 'Executive Prestige & Clinical Transformation', desc: 'Flawless complexion, eliminated rosacea flare-ups, and Paris laboratory status.' },
          likelihood: { title: '56-Day Double-Blind French Laboratory Proof', desc: '42% statistically verified barrier thickness lift with ISO bio-safety trials.' },
          timeDelay: { title: '12-Hour Overnight Micro-Relief', desc: 'Noticeable reduction in skin inflammation and redness on Night 1.' },
          effort: { title: '1-Step Precision Metered Protocol', desc: 'Single metered dropper replaces morning and evening 10-step multi-product confusion.' },
          footerLaw: 'Mathematical Law: When Denominator (Time × Effort) Approaches 0, Perceived Value Approaches Infinity.'
        },
        {
          id: stackId,
          type: 'bonus-stack',
          x: 880,
          y: 120,
          width: 480,
          title: 'Trim & Stack Grand Slam Offer',
          items: [
            { title: 'Core: 50ml Copper Peptide Barrier Emulsion', desc: 'Micro-encapsulated copper peptides in frosted French flint glass', strike: 'AED 6,500' },
            { title: 'Speed: Rose-Gold Cryo-Sculpt Contouring Tool', desc: 'Accelerates lymphatic drainage and facial contouring in 3 minutes', strike: 'AED 4,200' },
            { title: 'Certainty: Private Biochemist Skin Health Hotline', desc: '24/7 WhatsApp VIP formulation hotline for seasonal dosage adjustments', strike: 'AED 12,000' },
            { title: 'Guarantee: 100% Empty-Bottle Risk Reversal', desc: 'Keep the cryo-tool and get full refund if skin fails to transform in 60 days', strike: 'AED 8,500' }
          ],
          totalValue: 'AED 31,200',
          price: 'AED 12,500 / mo'
        },
        {
          id: priceId,
          type: 'pricing',
          x: 1400,
          y: 120,
          width: 380,
          isFeatured: true,
          badge: '$100M GRAND SLAM VIP RETAINER',
          currency: 'AED',
          figure: '12,500',
          period: '/ Month (Quarterly Commitment)',
          features: [
            '3-Month Active Regimen Batch (3x 50ml French Flint Glass)',
            'Rose-Gold Cryo-Sculpt Contouring Tool Included',
            'Direct VIP WhatsApp Hotline to Senior Biochemist',
            '100% Empty-Bottle Unconditional Money-Back Guarantee',
            'Complimentary Collector Travel Pouch & Silk Sleeping Mask'
          ]
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 800,
          width: 860,
          title: 'Hormozi Problem-to-Solution Deliverable Stack',
          badge: 'VALUE MATRIX',
          headers: ['Client Friction / Fear', 'Underlying Bottleneck', 'Grand Slam Deliverable', 'Perceived Value (AED)'],
          rows: [
            ['Active irritation & redness', 'Molecular formula instability', '5.2% Micro-Encapsulated Peptides', '4,200'],
            ['Complex multi-step routines', 'Lack of vanity mirror clarity', 'Magnetic 1-Step Routine Mirror Card', '650'],
            ['Fear formula will fail on skin', 'Previous bad brand experiences', '56-Day Laboratory Proof Dossier', '5,000'],
            ['Running out of bottle unexpectedly', 'DTC replenishment friction', 'Automated 45-Day Refill Concierge', '2,400']
          ]
        },
        {
          id: metricId,
          type: 'metric',
          x: 1000,
          y: 800,
          width: 320,
          title: 'VALUE TO PRICE RATIO',
          badge: '10:1 VALUE ASYMMETRY',
          deltaColor: 'tag-gold',
          figure: '10x Value',
          subtitle: 'AED 31,200 Stacked Worth / AED 12,500 Investment'
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1360,
          y: 800,
          width: 280,
          height: 190,
          color: 'yellow',
          rotation: -1.5,
          hasTape: true,
          header: 'THE GUARANTEE',
          content: 'The Empty-Bottle Guarantee: "If your skin does not visibly transform in 60 days, we return 100% of your investment and you keep the cryo-tool."',
          footer: 'RISK REVERSAL'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1680,
          y: 800,
          width: 280,
          height: 190,
          color: 'rose',
          rotation: 2,
          hasTape: true,
          header: 'HORMOZI LAW',
          content: 'Never compete on price. When you drop prices, you attract customers who complain the most and refer the least. Double the price and 10x the perceived value.',
          footer: 'PRICING DISCIPLINE'
        }
      ];

      newConnections = [
        { id: `conn-hz-1`, from: veId, fromAnchor: 'right', to: stackId, toAnchor: 'left', style: 'solid', color: 'gold', label: 'Value Equation → Bonus Stack' },
        { id: `conn-hz-2`, from: stackId, fromAnchor: 'right', to: priceId, toAnchor: 'left', style: 'solid', color: 'green', label: 'Stacked Retainer' }
      ];
    } else if (templateKey === 'ottley-ai' || templateKey === 'ottley') {
      title = 'Liam Ottley • AI Automation & Autonomous Systems Pipeline';
      const n1Id = `node-ot-1-${Date.now()}`;
      const n2Id = `node-ot-2-${Date.now()}`;
      const n3Id = `node-ot-3-${Date.now()}`;
      const n4Id = `node-ot-4-${Date.now()}`;
      const tblId = `table-ot-${Date.now()}`;
      const metricId = `metric-ot-${Date.now()}`;
      const s1Id = `sticky-ot-1-${Date.now()}`;
      const s2Id = `sticky-ot-2-${Date.now()}`;

      newElements = [
        {
          id: n1Id,
          type: 'pipeline-node',
          x: 100,
          y: 120,
          width: 380,
          nodeId: 'NODE_01: INGESTION',
          status: 'ONLINE 200 OK',
          title: 'Autonomous Ingestion Webhook',
          desc: 'Captures brand intake responses, gross ad spend, and SKU catalogs instantly from form submissions.',
          tech: ['Cloudflare Worker', 'Make.com Webhook', 'REST API'],
          steps: [
            'Ingests form JSON payload in <120ms',
            'Normalizes currency and spend metrics',
            'Emits event to scoring agent queue'
          ],
          latency: 'Latency: <120ms',
          compute: 'Cost: $0.0018 / run'
        },
        {
          id: n2Id,
          type: 'pipeline-node',
          x: 520,
          y: 120,
          width: 380,
          nodeId: 'NODE_02: CLASSIFIER',
          status: 'ONLINE 200 OK',
          title: 'Gemini 3.5 Classifier Agent',
          desc: 'Evaluates qualification criteria: flags brands with > $30k/mo media spend for VIP executive lane.',
          tech: ['Gemini 3.5 Flash', 'Structured JSON Schema'],
          steps: [
            'Validates MER and monthly media spend',
            'Extracts target demographic archetypes',
            'Assigns qualification tier & priority route'
          ],
          latency: 'Latency: <850ms',
          compute: 'Cost: $0.0042 / run'
        },
        {
          id: n3Id,
          type: 'pipeline-node',
          x: 940,
          y: 120,
          width: 380,
          nodeId: 'NODE_03: RAG SYNTHESIS',
          status: 'ONLINE 200 OK',
          title: 'Vector RAG & Clinical Lab DB',
          desc: 'Grounds brand offer in clinical laboratory research papers, formulation bio-safety, and regulatory trials.',
          tech: ['Supabase pgvector', 'OpenAI Embeddings', 'ISO 11930 DB'],
          steps: [
            'Vector semantic search against 500+ lab trials',
            'Synthesizes 3 clinical differentiator claims',
            'Prepares audit brief for human sign-off'
          ],
          latency: 'Latency: <1.4s',
          compute: 'Cost: $0.0075 / run'
        },
        {
          id: n4Id,
          type: 'pipeline-node',
          x: 1360,
          y: 120,
          width: 380,
          nodeId: 'NODE_04: DISPATCH',
          status: 'ONLINE 200 OK',
          title: 'POLISH Board Auto-Spawning',
          desc: 'Auto-instantiates password-protected Whiteboard Studio instance and synchronizes with HubSpot CRM.',
          tech: ['POLISH Board API', 'HubSpot Webhook', 'WhatsApp API'],
          steps: [
            'Generates interactive custom Miro canvas',
            'Dispatches VIP WhatsApp calendar invite',
            'Logs opportunity to enterprise sales CRM'
          ],
          latency: 'Latency: <420ms',
          compute: 'Cost: $0.0021 / run'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 640,
          width: 900,
          title: 'Liam Ottley Autonomous Systems Integration Architecture',
          badge: 'SYSTEMS TELEMETRY',
          headers: ['Node ID', 'Agent / Tool', 'Input Trigger', 'Latency Target', 'Fallback Protocol'],
          rows: [
            ['01_INGEST', 'Cloudflare Worker Webhook', 'Intake Form Submission', '< 150ms', 'Dead-Letter Queue + Retries'],
            ['02_SCORE', 'Gemini 3.5 Flash', 'Ad Spend & Revenue Profile', '< 1.4s', 'Senior Advisor Manual Review'],
            ['03_SYNTHESIS', 'Vector Knowledge RAG', 'Cosmetic Clinical DB', '< 2.8s', 'Fallback to Cached Standard'],
            ['04_DISPATCH', 'POLISH Whiteboard API', 'Dossier Payload', '< 650ms', 'Auto-Retry with Backoff']
          ]
        },
        {
          id: metricId,
          type: 'metric',
          x: 1040,
          y: 640,
          width: 320,
          title: 'PIPELINE TIME-TO-DELIVERY',
          badge: '98.4% AUTONOMOUS',
          deltaColor: 'tag-green',
          figure: '3.8 Minutes',
          subtitle: 'Intake-to-Dossier Turnaround vs 48 Hours Manual'
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1400,
          y: 640,
          width: 280,
          height: 190,
          color: 'mint',
          rotation: -1.5,
          hasTape: true,
          header: 'OTTLEY AAA RULE',
          content: 'Never sell customized one-off code when you can standardize modular systems. Productize your AI agency architecture into repeatable nodes.',
          footer: 'SYSTEM SCALE'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1720,
          y: 640,
          width: 280,
          height: 190,
          color: 'noir',
          rotation: 2,
          hasTape: true,
          header: 'HUMAN IN THE LOOP',
          content: 'AI handles 95% of the data gathering and drafting; humans provide the sovereign executive judgment that commands $25,000 advisory fees.',
          footer: 'QUALITY GATE'
        }
      ];

      newConnections = [
        { id: `conn-ot-1`, from: n1Id, fromAnchor: 'right', to: n2Id, toAnchor: 'left', style: 'solid', color: 'gold', label: '1. Ingest Payload' },
        { id: `conn-ot-2`, from: n2Id, fromAnchor: 'right', to: n3Id, toAnchor: 'left', style: 'solid', color: 'green', label: '2. Qualified Tier' },
        { id: `conn-ot-3`, from: n3Id, fromAnchor: 'right', to: n4Id, toAnchor: 'left', style: 'solid', color: 'gold', label: '3. Audit Dossier' }
      ];
    } else if (templateKey === 'bradley-inbound' || templateKey === 'bradley') {
      title = 'Chris Bradley • High-Ticket Inbound & Diagnostic Closing Blueprint';
      const f1Id = `frame-cb-1-${Date.now()}`;
      const diagId = `diag-cb-${Date.now()}`;
      const rxId = `rx-cb-${Date.now()}`;
      const formId = `form-cb-${Date.now()}`;
      const s1Id = `sticky-cb-1-${Date.now()}`;
      const s2Id = `sticky-cb-2-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 540,
          height: 540,
          frameNumber: '01',
          titlePill: 'AUTHORITY MEDIA',
          headline: '12-Minute Inbound',
          serifAccent: 'Authority Breakdown',
          description: 'Attracting high-net-worth beauty brand founders through undeniable proof breakdowns, zero sales chasing.',
          boxes: [
            { tag: 'AUTHORITY VIDEO', tagColor: 'gold', title: 'Unit Economics Deconstruction', content: 'Publishing 20-minute deconstructions of formulation economics and Meta Advantage+ ad spend leakage.' },
            { tag: 'DIAGNOSTIC BRIDGE', tagColor: 'blue', title: 'Clinical Diagnostic Intake', content: 'Positioning the initial consultation as an objective clinical diagnostic rather than a generic sales call.' }
          ]
        },
        {
          id: diagId,
          type: 'diagnostic-protocol',
          x: 680,
          y: 120,
          width: 680,
          title: 'Consultative Diagnostic & Prescription Protocol',
          stages: [
            { roman: 'STAGE I', title: 'Symptom Elicitation', desc: 'Identify visible pain: client complains of Meta CAC inflation and high single-purchase churn.' },
            { roman: 'STAGE II', title: 'Root Pathophysiology', desc: 'Diagnose systemic leak: lack of clinical authority assets and failure to package regimen routine bundles.' },
            { roman: 'STAGE III', title: 'Cost of Inaction Prognosis', desc: 'Compound impact: continuing current tactics burns AED 180,000 in wasted ad spend over 12 months.' },
            { roman: 'STAGE IV', title: 'Prescription of Care', desc: 'Prescribe 90-Day Sovereign Container: Parisian lab positioning, DTC regimen rebrand, and Meta ASC creative.' },
            { roman: 'STAGE V', title: 'The Silence Rule', desc: 'State fee with absolute certainty: AED 25,000 / mo quarterly retainer. Stop speaking and hold the frame.' }
          ]
        },
        {
          id: rxId,
          type: 'prescription',
          x: 1400,
          y: 120,
          width: 420,
          title: 'Sovereign Advisory Retainer Rx',
          fee: 'AED 25,000 / Month',
          term: 'Closed-Door 90-Day Container Commitment',
          term1: 'Bi-Weekly 1-on-1 Consultative Diagnostic & Growth Offsite',
          term2: '24/7 Async Sovereign Partner WhatsApp Hotline',
          term3: 'Creative Sandbox Teardowns & Multi-Touch Funnel Architecture'
        },
        {
          id: formId,
          type: 'form',
          x: 100,
          y: 760,
          width: 660,
          title: 'Chris Bradley 4-Pillar Diagnostic Intake Worksheet',
          badge: 'DIAGNOSTIC INTAKE',
          desc: 'Complete prior to client presentation to calibrate the prescription of care.',
          fields: [
            { id: 'cb-1', type: 'input', label: '01. Current Monthly Gross Revenue & Media Spend (AED / $)', badge: 'METRIC', instructions: 'What is the blended media spend and contribution margin?', value: '$65,000 / mo spend • 4.2x Target MER' },
            { id: 'cb-2', type: 'textarea', label: '02. Primary Operational Growth Bottleneck', badge: 'DIAGNOSTIC', instructions: 'Where is founder attention or cashflow experiencing friction?', value: 'Creative fatigue on Meta every 14 days and single-purchase replenishment churn.' }
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 800,
          y: 780,
          width: 290,
          height: 200,
          color: 'yellow',
          rotation: -1.5,
          hasTape: true,
          header: 'DOCTOR-PATIENT FRAME',
          content: 'Top surgeons never chase patients down the hall or offer holiday discounts. They diagnose the illness with calm authority, prescribe the treatment, and state the fee.',
          footer: 'BRADLEY PRINCIPLE'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1120,
          y: 780,
          width: 290,
          height: 200,
          color: 'rose',
          rotation: 2,
          hasTape: true,
          header: 'CLOSING RULE',
          content: 'The person who asks the questions controls the frame. If you find yourself pitching for 40 minutes, you have already lost. The client should speak 70% of the call.',
          footer: 'FRAME CONTROL'
        }
      ];

      newConnections = [
        { id: `conn-cb-1`, from: f1Id, fromAnchor: 'right', to: diagId, toAnchor: 'left', style: 'dashed', color: 'gold', label: 'Inbound → Diagnostic' },
        { id: `conn-cb-2`, from: diagId, fromAnchor: 'right', to: rxId, toAnchor: 'left', style: 'dashed', color: 'green', label: 'Prescription of Care' }
      ];
    } else if (templateKey === 'morgan-outbound' || templateKey === 'morgan') {
      title = 'Charlie Morgan • Sovereign Outbound Machine & Prospect Conversion Engine';
      const triadId = `triad-cm-${Date.now()}`;
      const cadenceId = `cadence-cm-${Date.now()}`;
      const tblId = `table-cm-${Date.now()}`;
      const metricId = `metric-cm-${Date.now()}`;
      const s1Id = `sticky-cm-1-${Date.now()}`;
      const s2Id = `sticky-cm-2-${Date.now()}`;

      newElements = [
        {
          id: triadId,
          type: 'belief-triad',
          x: 100,
          y: 120,
          width: 720,
          title: 'The 3 Limiting Beliefs Triad',
          vTitle: 'The Agency Vehicle',
          vBody: 'Shift belief from "Generic marketing agencies burn cash on vanity ads" to "Scientific clinical accelerators multiply cash on first-purchase AOV."',
          iTitle: 'Internal Capability',
          iBody: 'Shift belief from "Our team has no time or capacity to handle complex campaigns" to "Modular turnkey systems require zero internal staff overhead."',
          eTitle: 'External Market',
          eBody: 'Shift belief from "High-net-worth beauty buyers are cutting spend" to "Affluent cosmetic consumers actively seek lab-certified formulation transparency."'
        },
        {
          id: cadenceId,
          type: 'cadence-timeline',
          x: 960,
          y: 120,
          width: 780,
          title: '21-Day 8-Touch Outbound Machine'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 580,
          width: 900,
          title: 'Charlie Morgan Outbound Cadence & Conversion Pipeline',
          badge: 'PIPELINE EQUATION',
          headers: ['Outbound Funnel Stage', 'Weekly Target', 'Conversion %', 'Pipeline Output', 'Target CPA (AED)'],
          rows: [
            ['Verified Brand Founder Outreach', '1,000 Contacts', '100%', '1,000 Touches Sent', '0.80'],
            ['Positive Executive Response Rate', '45 Replies', '4.5%', '45 Qualified Dialogues', '17.80'],
            ['Custom Video Teardown Booked', '18 Demos', '40.0%', '18 Loom Presentations', '44.50'],
            ['Quarterly Client Retainer Closed', '3 Clients', '16.7%', 'AED 75,000 New ARR', '267.00']
          ]
        },
        {
          id: metricId,
          type: 'metric',
          x: 1040,
          y: 580,
          width: 320,
          title: 'OUTBOUND CASH ROI',
          badge: '93.6x PIPELINE MULTIPLIER',
          deltaColor: 'tag-green',
          figure: 'AED 75,000',
          subtitle: 'Weekly Retainer Intake on AED 800 Domain & Data Spend'
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1400,
          y: 580,
          width: 280,
          height: 190,
          color: 'noir',
          rotation: -1.5,
          hasTape: true,
          header: 'MORGAN IRON LAW',
          content: 'B2B sales is not subjective magic. It is pure statistics: Volume of Outreach × Accuracy of ICP List × Relatability of Script = Inevitable Pipeline.',
          footer: 'OUTBOUND MATH'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1720,
          y: 580,
          width: 280,
          height: 190,
          color: 'rose',
          rotation: 2,
          hasTape: true,
          header: 'OBJECTION REFRAME',
          content: '"We already do this in-house" is never a rejection; it is evidence that they value the function. Position your retainer as a force-multiplier for their team.',
          footer: 'OBJECTION REALITY'
        }
      ];

      newConnections = [
        { id: `conn-cm-1`, from: triadId, fromAnchor: 'right', to: cadenceId, toAnchor: 'left', style: 'dashed', color: 'gold', label: 'Dismantle Beliefs' }
      ];
    } else if (templateKey === 'ajsmart-sprint' || templateKey === 'ajsmart') {
      title = 'AJ&Smart • 4-Day Product Strategy & Executive Facilitation Sprint';
      const swimlaneId = `swimlane-aj-${Date.now()}`;
      const dots1Id = `dots-aj-1-${Date.now()}`;
      const dots2Id = `dots-aj-2-${Date.now()}`;
      const matrixId = `ldj-aj-${Date.now()}`;
      const tblId = `table-aj-${Date.now()}`;
      const s1Id = `sticky-aj-1-${Date.now()}`;
      const s2Id = `sticky-aj-2-${Date.now()}`;

      newElements = [
        {
          id: swimlaneId,
          type: 'sprint-swimlane',
          x: 100,
          y: 120,
          width: 1220,
          title: 'AJ&Smart 4-Day Product Strategy & Facilitation Sprint'
        },
        {
          id: dots1Id,
          type: 'voting-dots',
          x: 430,
          y: 350,
          dots: [
            { color: 'dot-violet', text: 'JS' },
            { color: 'dot-mint', text: 'AK' },
            { color: 'dot-gold', text: 'MH' }
          ]
        },
        {
          id: dots2Id,
          type: 'voting-dots',
          x: 730,
          y: 350,
          dots: [
            { color: 'dot-rose', text: 'EL' },
            { color: 'dot-mint', text: 'AK' }
          ]
        },
        {
          id: matrixId,
          type: 'ldj-matrix',
          x: 1360,
          y: 120,
          width: 580,
          title: 'LDJ Impact vs. Effort Prioritization Matrix'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 680,
          width: 900,
          title: 'AJ&Smart Day 4 User Testing & Usability Matrix',
          badge: 'TEST MATRIX',
          headers: ['Target Tester', 'Customer Archetype', 'First Impression', 'Price Reaction (AED 420)', 'Purchase Intent'],
          rows: [
            ['Tester 01 (Elena)', 'HNW Cosmetic Enthusiast', 'Frosted glass feels ultra-luxurious', 'Expected AED 500+ for lab formula', 'High (Ready to buy)'],
            ['Tester 02 (Sarah)', 'Clinical Derm Patient', 'Appreciated transparent trial data', 'Wants 30ml travel mini option', 'Medium (Wants sample)'],
            ['Tester 03 (Nadia)', 'Clean Beauty Advocate', 'Scrutinized preservative bio-safety', 'Comfortable once ISO 11930 cited', 'High (Impressed by data)'],
            ['Tester 04 (Fatima)', 'VIP Luxury Gifter', 'Wax seal & unboxing feels museum-grade', 'Very attractive for gifts', 'Immediate (Pre-ordered)']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1040,
          y: 680,
          width: 290,
          height: 190,
          color: 'yellow',
          rotation: -1.5,
          hasTape: true,
          header: 'HMW QUESTION',
          content: 'How Might We communicate clinical peptide potency without overwhelming non-scientific beauty buyers with medical jargon?',
          footer: 'SPRINT ANCHOR'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1370,
          y: 680,
          width: 290,
          height: 190,
          color: 'blue',
          rotation: 2,
          hasTape: true,
          header: 'TOGETHER ALONE',
          content: 'Never brainstorm out loud. Brainstorm silently on stickies, then vote. It completely removes extrovert dominance and hippo bias.',
          footer: 'FACILITATION LAW'
        }
      ];

      newConnections = [
        { id: `conn-aj-1`, from: swimlaneId, fromAnchor: 'right', to: matrixId, toAnchor: 'left', style: 'dashed', color: 'gold', label: 'Decisions → Prioritization' }
      ];
    } else if (templateKey === 'isenberg-community' || templateKey === 'isenberg') {
      title = 'Greg Isenberg • Community-Led Growth Flywheel & Unbundling Canvas';
      const unbundleId = `unbundle-gi-${Date.now()}`;
      const flywheelId = `flywheel-gi-${Date.now()}`;
      const tblId = `table-gi-${Date.now()}`;
      const metricId = `metric-gi-${Date.now()}`;
      const s1Id = `sticky-gi-1-${Date.now()}`;
      const s2Id = `sticky-gi-2-${Date.now()}`;

      newElements = [
        {
          id: unbundleId,
          type: 'unbundling-tree',
          x: 100,
          y: 120,
          width: 620,
          title: 'Reddit Platform Unbundling Engine',
          communityPill: 'r/30PlusSkinCare • 2.4M'
        },
        {
          id: flywheelId,
          type: 'flywheel-rings',
          x: 760,
          y: 120,
          width: 580,
          title: 'Audience → Community → Product (ACP)'
        },
        {
          id: metricId,
          type: 'metric',
          x: 1380,
          y: 120,
          width: 320,
          title: 'COMMUNITY LTV EXPANSION',
          badge: '+84% LTV MULTIPLIER',
          deltaColor: 'tag-gold',
          figure: 'AED 3,250',
          subtitle: 'Community Member 12-Mo LTV vs AED 380 DTC Single Buyer'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 640,
          width: 900,
          title: 'Greg Isenberg Subreddit & Community Unbundling Matrix',
          badge: 'UNBUNDLING ENGINE',
          headers: ['Broad Digital Watering Hole', 'Core Unaddressed Frustration', 'Unbundled Luxury Product', 'Monetization Model'],
          rows: [
            ['r/30PlusSkinCare (2.4M Members)', 'Retinol irritation & barrier damage', 'Personalized Peptide Regimen Box', 'AED 420 / Month Auto-Refill'],
            ['TikTok #DermTok (12B Views)', 'Dermatologist claim skepticism', 'Third-Party Laboratory Claims Registry', 'AED 4,500 / Brand / Year'],
            ['Dubai Luxury Vanity Club', 'Access to unreleased Parisian batches', 'Secret Atelier Vault VIP Access', 'AED 15,000 / Year Retainer']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1040,
          y: 640,
          width: 280,
          height: 190,
          color: 'rose',
          rotation: -1.5,
          hasTape: true,
          header: 'ISENBERG FLYWHEEL',
          content: 'Build the community first, product second. When you own the community, your customer acquisition cost drops to near zero because members are your co-designers.',
          footer: 'COMMUNITY LAW'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1370,
          y: 640,
          width: 280,
          height: 190,
          color: 'mint',
          rotation: 2,
          hasTape: true,
          header: 'UNBUNDLING LAW',
          content: 'Every massive subreddit, Facebook group, or Discord with > 100k members is an unbundled $10M luxury company waiting to be built with world-class branding.',
          footer: 'UNBUNDLING THESIS'
        }
      ];

      newConnections = [
        { id: `conn-gi-1`, from: unbundleId, fromAnchor: 'right', to: flywheelId, toAnchor: 'left', style: 'dashed', color: 'gold', label: 'Unbundling → Flywheel' },
        { id: `conn-gi-2`, from: flywheelId, fromAnchor: 'bottom', to: tblId, toAnchor: 'top', style: 'dashed', color: 'green', label: 'Product Roadmap' }
      ];
    } else if (templateKey === 'scaling-blueprint') {
      title = '90-Day Luxury Beauty Scaling Blueprint';
      const f1Id = `frame-sb-1-${Date.now()}`;
      const f2Id = `frame-sb-2-${Date.now()}`;
      const priceId = `pricing-sb-${Date.now()}`;
      const scriptId = `script-sb-${Date.now()}`;
      const tblId = `table-sb-${Date.now()}`;
      const s1Id = `sticky-sb-1-${Date.now()}`;
      const s2Id = `sticky-sb-2-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '01',
          titlePill: 'PAID MEDIA ACQUISITION',
          headline: 'Advantage+ & Creator',
          serifAccent: 'Liquidity Architecture',
          description: 'Engineering a predictable net-new customer acquisition machine via Meta Advantage+ ASC and whitelisted TikTok Spark ads without resetting algorithmic learning.',
          boxes: [
            { tag: 'PROSPECTING SANDBOX', tagColor: 'gold', title: 'Dynamic Creative Testing (DCT)', content: '3 video thumbstop variations x 2 body messaging angles tested in isolated sandbox campaigns before graduation to ASC core budget.' },
            { tag: 'LANDING PAGE LIFT', tagColor: 'blue', title: 'Dedicated Advertorial Presell', content: 'Directing high-intent prospecting clicks to editorial advertorials explaining clinical formulation science, lifting conversion velocity by 34%.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '02',
          titlePill: 'OFFER & BUNDLE MECHANICS',
          headline: 'Regimen Architecture &',
          serifAccent: 'AOV Expansion',
          description: 'Transitioning single-SKU purchasers into 3-step clinical routine buyers, lifting first-order average order value from AED 180 to AED 420+.',
          boxes: [
            { tag: 'CORE REGIMEN', tagColor: 'green', title: '3-Step Daily Protocol', content: 'Packaging Cleanser + Peptide Serum + Barrier Cream with exclusive collector travel pouch, making single-product checkout obsolete.' },
            { tag: 'SLIDE CART UPSELL', tagColor: 'rose', title: 'One-Click Post-Purchase Bump', content: 'Micro-dose travel mini and silk sleeping mask upsell triggers before final payment authorization, maintaining 22% uptake rate.' }
          ]
        },
        {
          id: priceId,
          type: 'pricing',
          x: 1540,
          y: 120,
          width: 380,
          isFeatured: true,
          badge: '90-DAY SCALING ACCELERATOR',
          currency: 'AED',
          figure: '28,000',
          period: '/ Month + 8% Growth',
          features: [
            'Meta ASC & TikTok Spark Media Buying ($25k-$100k Spend)',
            'Bi-Weekly UGC & Creator Direction (12 High-Res Cuts)',
            'Klaviyo Routine Replenishment & SMS Concierge Buildout',
            'Weekly Executive Unit Economics & MER Review',
            'Full Access to POLISH Whiteboard Strategy Studio'
          ]
        },
        {
          id: scriptId,
          type: 'script',
          x: 1540,
          y: 470,
          width: 380,
          height: 190,
          content: '"Scale in luxury beauty is not achieved by shouting louder. It is engineered through formulation transparency, frictionless routine bundling, and relentless replenishment cadence."'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 720,
          width: 880,
          title: '90-Day Scaling Trajectory & Quarterly Milestones',
          badge: 'EXECUTION TIMELINE',
          headers: ['Phase', 'Focus Area', 'Target Blended MER', 'Key Deliverable', 'Expected Lift'],
          rows: [
            ['Month 01', 'Baseline Audit & Creative Sandbox', '2.8x - 3.2x', '3:2:2 DCT Ads + Advertorial Bridge', '+35% First-Order AOV'],
            ['Month 02', 'Advantage+ ASC Scale & Creator Seeding', '3.4x - 3.8x', '12 Whitelisted Creator Spark Ads', '+75% Net Prospecting Volume'],
            ['Month 03', 'Klaviyo Replenishment & LTV Flywheel', '4.2x - 4.6x', '42-Day Automated Routine Refill Loop', '+110% Unlocked Monthly GMV']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1020,
          y: 720,
          width: 280,
          height: 190,
          color: 'yellow',
          rotation: -1.5,
          hasTape: true,
          header: 'UNIT ECONOMICS',
          content: 'Target a minimum 78% Gross Margin. Without healthy gross margins, rising paid media customer acquisition costs will erode your scaling runway.',
          footer: 'MARGIN MANDATE'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1340,
          y: 720,
          width: 280,
          height: 190,
          color: 'mint',
          rotation: 2,
          hasTape: true,
          header: 'CASH CONVERSION',
          content: 'Negotiate 60-day supplier payment terms with your cosmetic laboratory once monthly order volume exceeds 3,000 units to unlock free cash flow.',
          footer: 'TREASURY GOVERNANCE'
        }
      ];

      newConnections = [
        { id: `conn-sb-1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' },
        { id: `conn-sb-2`, from: f2Id, fromAnchor: 'right', to: priceId, toAnchor: 'left', style: 'dashed', color: 'green', label: '' }
      ];
    } else if (templateKey === 'retention-flywheel') {
      title = 'DTC Skincare Retention & Replenishment Flywheel';
      const f1Id = `frame-rf-1-${Date.now()}`;
      const f2Id = `frame-rf-2-${Date.now()}`;
      const priceId = `pricing-rf-${Date.now()}`;
      const scriptId = `script-rf-${Date.now()}`;
      const tblId = `table-rf-${Date.now()}`;
      const s1Id = `sticky-rf-1-${Date.now()}`;
      const s2Id = `sticky-rf-2-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '01',
          titlePill: 'POST-PURCHASE INDUCTION',
          headline: 'Sensory Unboxing &',
          serifAccent: 'Skin Protocol Coaching',
          description: 'Transforming first delivery from a postal transaction into an editorial unboxing ritual that drives immediate Day 1 product adoption and application compliance.',
          boxes: [
            { tag: 'UNBOXING RITUAL', tagColor: 'rose', title: 'QR Ritual Companion', content: 'Embossed foil card linking to 90-second video tutorial with the brand founder explaining application technique and active ingredient synergy.' },
            { tag: 'DAY 3 CHECK-IN', tagColor: 'gold', title: 'Non-Promotional SMS Care', content: 'Conversational SMS asking: "How does your skin feel after your first 48 hours with the Active Serum?" Zero marketing pitch, 92% positive sentiment.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '02',
          titlePill: 'PREDICTIVE REPLENISHMENT',
          headline: 'Jar Burn Calculations &',
          serifAccent: '1-Click Refill Loops',
          description: 'Triggering refill opportunities precisely when bottle volume reaches 15%, before the consumer lapses into competitor browsing or drugstore substitutes.',
          boxes: [
            { tag: 'BURN RATE ENGINE', tagColor: 'green', title: '42-Day Dynamic SMS Refill Prompt', content: 'Smart algorithm calculates expected usage cadence. Delivers 1-click Apple Pay refill link with subscriber pricing benefit 10 days before bottom-of-jar.' },
            { tag: 'SUBSCRIPTION LADDER', tagColor: 'blue', title: 'Haute Atelier Refill Club', content: 'Eco-luxury aluminum refill pouches discounted 18% with quarterly curated chemist lab samples included free.' }
          ]
        },
        {
          id: priceId,
          type: 'pricing',
          x: 1540,
          y: 120,
          width: 380,
          isFeatured: true,
          badge: 'RETENTION VALUE PROJECTION',
          currency: 'AED',
          figure: '185,000',
          period: 'Unlocked 12-Mo LTV',
          features: [
            '60-Day Repeat Purchase Rate Lift: +48%',
            'Active Replenishment Subscriber Retention: 84%',
            'Blended Customer Lifetime Value: 3.4x CAC',
            'Lapsed Customer Win-Back Conversion: 16.2%',
            'VIP Laboratory Community Engagement Score: 92/100'
          ]
        },
        {
          id: scriptId,
          type: 'script',
          x: 1540,
          y: 470,
          width: 380,
          height: 190,
          content: '"The second sale is never made on product utility alone; it is earned through how intensely the brand respected the ritual between Day 1 and Day 45."'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 720,
          width: 880,
          title: 'Klaviyo & SMS Automated Retention Journey Matrix',
          badge: 'JOURNEY CADENCE',
          headers: ['Day Interval', 'Channel', 'Strategic Purpose', 'Trigger Condition', 'Observed CVR'],
          rows: [
            ['Day 0 (Delivery)', 'Email + SMS', 'Sensory Unboxing & QR Routine Guide', 'Carrier "Delivered" webhook', '68% Open / 34% Click'],
            ['Day 07', 'Editorial Email', '"What to expect in Week 2" (Cell turnover)', 'Opened Day 0 message', '54% Open / 18% Click'],
            ['Day 28', 'Conversational SMS', 'Progress Check-In & Companion Booster', 'No support ticket opened', '46% Reply Rate'],
            ['Day 42', 'SMS + VIP Email', '1-Click Predictive Replenishment Link', 'Jar 85% depleted threshold', '31% Repeat Purchase CVR']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1020,
          y: 720,
          width: 280,
          height: 190,
          color: 'rose',
          rotation: -1.5,
          hasTape: true,
          header: 'RETENTION AXIOM',
          content: 'Never offer discounts on first reorder. Offer formulation upgrades, deluxe mini travel formats, or exclusive founder notes to preserve brand prestige.',
          footer: 'PRESTIGE INTEGRITY'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1340,
          y: 720,
          width: 280,
          height: 190,
          color: 'mint',
          rotation: 2,
          hasTape: true,
          header: 'CHURN INTERCEPT',
          content: 'If a customer skips a delivery, send a bespoke SMS asking if they would like to adjust delivery frequency rather than cancelling outright.',
          footer: 'CHURN DEFENSE'
        }
      ];

      newConnections = [
        { id: `conn-rf-1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'rose', label: '' },
        { id: `conn-rf-2`, from: f2Id, fromAnchor: 'right', to: priceId, toAnchor: 'left', style: 'dashed', color: 'green', label: '' }
      ];
    } else if (templateKey === 'personal-branding') {
      title = 'Personal Branding & Sovereign Authority Blueprint';
      const f1Id = `frame-pb-1-${Date.now()}`;
      const f2Id = `frame-pb-2-${Date.now()}`;
      const scriptId = `script-pb-${Date.now()}`;
      const priceId = `pricing-pb-${Date.now()}`;
      const tblId = `table-pb-${Date.now()}`;
      const s1Id = `sticky-pb-1-${Date.now()}`;
      const s2Id = `sticky-pb-2-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '01',
          titlePill: 'SOVEREIGN POSITIONING',
          headline: 'Executive Persona &',
          serifAccent: 'Category Ownership',
          description: 'Positioning the founder as the undisputed sovereign authority in luxury beauty, formulation science, and clinical aesthetics.',
          boxes: [
            { tag: 'FOUNDER THESIS', tagColor: 'gold', title: 'The Polarizing Point of View', content: 'Challenge industry consensus: "Clean beauty is unregulated marketing; cosmetic biochemistry is the only sustainable luxury."' },
            { tag: 'PILLAR NARRATIVE', tagColor: 'rose', title: 'Behind-The-Glass Formulation', content: 'Deconstruct laboratory trial failures, raw botanical extraction chemistry, and unfiltered Parisian factory visits.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '02',
          titlePill: 'CONTENT SYNDICATION',
          headline: 'Multi-Channel Media',
          serifAccent: 'Velocity Engine',
          description: 'Engineering a 1-to-many syndication architecture converting 1 long-form keynote into 30 high-impact sovereign media assets.',
          boxes: [
            { tag: 'LONG-FORM PILLAR', tagColor: 'blue', title: 'Substack & Private Journal', content: 'Bi-weekly 1,800-word deep dives into cosmetic chemistry economics and DTC brand equity preservation.' },
            { tag: 'SHORT-FORM HOOKS', tagColor: 'green', title: 'LinkedIn & 9:16 Video Micro-Clips', content: '15-second cinematic soundbites extracted with raking laboratory lighting and hard-hitting contrarian hooks.' }
          ]
        },
        {
          id: scriptId,
          type: 'script',
          x: 1540,
          y: 120,
          width: 380,
          height: 200,
          content: '"Elite founders do not pitch services cold. They publish undeniable technical truth until the world\'s most discerning brands knock on their atelier door."'
        },
        {
          id: priceId,
          type: 'pricing',
          x: 1540,
          y: 360,
          width: 380,
          isFeatured: true,
          badge: 'FOUNDER ADVISORY RETAINER',
          currency: 'AED',
          figure: '15,000',
          period: '/ Month',
          features: [
            'Bi-Weekly 1-on-1 Strategic Narrative Session',
            'Ghostwritten Substack & LinkedIn Pillar Essays',
            'Cinematic 9:16 Video Editing (8 Cuts / Month)',
            'Keynote Speech Architecture & PR Placement',
            'Direct Private Concierge WhatsApp Access'
          ]
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 720,
          width: 880,
          title: 'Weekly Publishing Cadence & Channel Architecture',
          badge: 'MEDIA CADENCE',
          headers: ['Day', 'Platform', 'Asset Format', 'Strategic Hook Angle', 'Primary CTA'],
          rows: [
            ['Monday', 'LinkedIn & X', 'Text Breakdown + Carousel', 'Deconstructing a $100M beauty acquisition', 'Subscribe to Atelier Memo'],
            ['Wednesday', 'Instagram / TikTok', '9:16 Laboratory Video', 'Why 90% of vitamin C serums oxidize on skin', 'Comment "FORMULA" for PDF'],
            ['Friday', 'Substack Editorial', 'Long-Form Strategic Essay', 'The Death of Aggressive Performance Marketing', 'Private Advisory Application'],
            ['Sunday', 'Private WhatsApp / VIP', 'Voice Memo & Behind Scenes', 'Unfiltered weekend lab thoughts & formulation notes', 'Passive Sovereign Trust']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1020,
          y: 720,
          width: 280,
          height: 190,
          color: 'yellow',
          rotation: -1.5,
          hasTape: true,
          header: 'VOICE PRINCIPLE',
          content: 'Speak only with absolute conviction. Never use timid hedging ("in my opinion", "I think"). State biochemistry principles as undeniable physical facts.',
          footer: 'EXECUTIVE TONE'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1340,
          y: 720,
          width: 280,
          height: 190,
          color: 'rose',
          rotation: 2,
          hasTape: true,
          header: 'CONVERSION BRIDGE',
          content: 'Every single piece of founder media must contain a passive conversion pathway leading to the private board application.',
          footer: 'GROWTH ANCHOR'
        }
      ];

      newConnections = [
        { id: `conn-pb-1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' },
        { id: `conn-pb-2`, from: f2Id, fromAnchor: 'right', to: scriptId, toAnchor: 'left', style: 'dashed', color: 'blue', label: '' }
      ];
    } else if (templateKey === 'meta-tiktok-ads') {
      title = 'Meta & TikTok Ads Performance Engine';
      const f1Id = `frame-ads-1-${Date.now()}`;
      const f2Id = `frame-ads-2-${Date.now()}`;
      const priceId = `pricing-ads-${Date.now()}`;
      const tblId = `table-ads-${Date.now()}`;
      const s1Id = `sticky-ads-1-${Date.now()}`;
      const s2Id = `sticky-ads-2-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '01',
          titlePill: 'META ADVANTAGE+ ASC',
          headline: 'Dynamic Creative &',
          serifAccent: 'Algorithmic Scale',
          description: 'Advantage+ Shopping Campaigns structured with dynamic creative testing (DCT) to maximize machine-learning liquidity without audience fragmentation.',
          boxes: [
            { tag: 'DCT SETUP', tagColor: 'blue', title: '3:2:2 Creative Testing Framework', content: '3 distinct video hooks, 2 core value proposition bodies, 2 lifestyle headlines into single dynamic sandbox ad sets.' },
            { tag: 'RETARGETING', tagColor: 'gold', title: 'High-Intent Friction Elimination', content: 'Custom audience exclusions ensuring 95%+ net-new prospecting with 180-day customer exclusions.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '02',
          titlePill: 'TIKTOK SPARK ENGINE',
          headline: 'Native UGC Velocity &',
          serifAccent: '3-Sec Hook Retention',
          description: 'Spark ads driven by native creator b-roll, high thumbstop rates, and organic trending audio whitelisted for commercial scale.',
          boxes: [
            { tag: 'THUMBSTOP', tagColor: 'rose', title: '0-3 Second Pattern Interrupt', content: 'Microscopic texture application, tactile pipette clicks, and visceral dermatologist reactions exceeding 38% 3s hold.' },
            { tag: 'LANDING PAGE BRIDGE', tagColor: 'green', title: 'Dedicated Advertorial Presell', content: 'Directing paid social traffic to customized editorial advertorials before the PDP to elevate blended AOV to AED 420+.' }
          ]
        },
        {
          id: priceId,
          type: 'pricing',
          x: 1540,
          y: 120,
          width: 370,
          isFeatured: true,
          badge: 'MONTHLY PERFORMANCE BUDGET',
          currency: 'AED',
          figure: '35,000',
          period: '/ Month Spend',
          features: [
            'Meta Advantage+ ASC Architecture ($20k / mo)',
            'TikTok Spark Whitelisted Ads ($15k / mo)',
            'Weekly 6-Asset Creative Testing Cadence',
            'Dedicated Advertorial & PDP Split Testing',
            'Real-Time Blended MER & First-Order ROAS Tracking'
          ]
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 720,
          width: 880,
          title: 'Weekly Paid Social Creative Testing Matrix',
          badge: 'CREATIVE TESTING',
          headers: ['Creative Concept', 'Platform', 'Visual Hook Angle', 'Thumbstop %', 'Target CPA (AED)', 'RoAS Status'],
          rows: [
            ['Lab Texture Drop', 'TikTok Spark', 'Micro-macro dropper on glass slide', '42.4%', '68.00', 'Scaling (3.8x)'],
            ['Derm Split Screen', 'Meta ASC', '"Stop using retinol incorrectly"', '39.1%', '74.50', 'Winner (4.2x)'],
            ['Unboxing ASMR', 'TikTok Spark', 'Uncoated paper rip + embossed seal', '31.2%', '92.00', 'Iterate Audio'],
            ['Founder Formulation', 'Meta ASC', '"Why big beauty cuts active percentages"', '46.8%', '58.00', 'Top Performer (5.1x)']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1020,
          y: 720,
          width: 280,
          height: 190,
          color: 'mint',
          rotation: -1.5,
          hasTape: true,
          header: 'SCALING RULE',
          content: 'Never increase campaign budget by more than 20% every 48 hours. Aggressive manual budget edits reset Meta machine learning algorithms.',
          footer: 'BUDGET DISCIPLINE'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1340,
          y: 720,
          width: 280,
          height: 190,
          color: 'rose',
          rotation: 2,
          hasTape: true,
          header: 'CREATIVE FATIGUE',
          content: 'Rotate winning angles every 18 days. Creative exhaustion is the #1 silent killer of high-volume cosmetics performance campaigns.',
          footer: 'CADENCE ALERT'
        }
      ];

      newConnections = [
        { id: `conn-ads-1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' },
        { id: `conn-ads-2`, from: f2Id, fromAnchor: 'right', to: priceId, toAnchor: 'left', style: 'dashed', color: 'green', label: '' }
      ];
    } else if (templateKey === 'strategy') {
      title = 'Executive Strategy Blueprint';
      const starter = getBuiltinStarterBoard();
      newElements = starter.elements;
      newConnections = starter.connections;
    } else if (templateKey === 'audit') {
      title = 'Beauty Brand Friction Diagnostic Audit';
      const f1Id = `frame-audit-1-${Date.now()}`;
      const f2Id = `frame-audit-2-${Date.now()}`;
      const s1Id = `sticky-audit-1-${Date.now()}`;
      const s2Id = `sticky-audit-2-${Date.now()}`;
      const tblId = `table-audit-${Date.now()}`;
      const formId = `form-audit-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 120,
          y: 120,
          width: 640,
          height: 520,
          frameNumber: '01',
          titlePill: 'CONVERSION DIAGNOSTIC',
          headline: 'Acquisition & CAC',
          serifAccent: 'Erosion',
          description: 'Diagnosing media spend dropoff, landing page friction, and high customer acquisition cost leaks.',
          boxes: [
            { tag: 'TRAFFIC LEAK', tagColor: 'rose', title: 'Top-of-Funnel Dropoff', content: 'Paid Meta & TikTok video hooks converting at under 1.4% due to generic category positioning.' },
            { tag: 'HOOK REMEDIATION', tagColor: 'gold', title: 'Micro-Batch Proof Angles', content: 'Laboratory formulation & dermatologist reaction assets outperforming polished studio ads 3:1.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 840,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '02',
          titlePill: 'RETENTION & LTV',
          headline: '90-Day Cohort',
          serifAccent: 'Preservation',
          description: 'Eliminating post-purchase silent churn and engineering predictable automated re-order velocity.',
          boxes: [
            { tag: 'CHURN VULNERABILITY', tagColor: 'rose', title: 'Single-Purchase Abandonment', content: '64% of first-time buyers do not re-order within 60 days without dedicated replenishment flow.' },
            { tag: 'VIP MEMBERSHIP', tagColor: 'green', title: 'Private Concierge Replenishment', content: 'Automated 45-day SMS + async WhatsApp refill reminders with exclusive gift-with-purchase tier.' }
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 770,
          y: 40,
          width: 270,
          height: 180,
          color: 'yellow',
          rotation: -1.5,
          hasTape: true,
          header: 'AUDIT ACTION',
          content: 'Audit unboxing collateral immediately. Insert gold-embossed QR card linking directly to private VIP loyalty tier.',
          footer: 'PRIORITY: HIGH'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1530,
          y: 240,
          width: 270,
          height: 180,
          color: 'rose',
          rotation: 1.8,
          hasTape: true,
          header: 'CHURN DRIVER',
          content: 'Replenishment emails are firing on day 14 instead of day 42. Customers feel spammed before the bottle is half empty.',
          footer: 'FIX: CADENCE'
        },
        {
          id: tblId,
          type: 'table',
          x: 120,
          y: 720,
          width: 660,
          title: 'Brand Friction & Remediation Matrix',
          badge: 'DIAGNOSTIC MATRIX',
          headers: ['Funnel Stage', 'Identified Friction', 'Remediation Protocol', 'Projected Lift'],
          rows: [
            ['Top of Funnel', 'High CAC ($48/order)', 'Deploy 6 Micro-Batch UGC Angles', '-35% Blended CAC'],
            ['Cart & Checkout', '22% Abandonment', 'Express 1-Click Apple Pay & Klarna', '+14% CVR Lift'],
            ['Post-Purchase', 'Single-Order Churn', 'Haute WhatsApp Replenishment', '+42% 90-Day LTV']
          ]
        },
        {
          id: formId,
          type: 'form',
          x: 840,
          y: 720,
          width: 580,
          title: 'Client Intake Calibration Worksheet',
          badge: 'INTAKE AUDIT',
          desc: 'Parameters to calibrate before presenting audit roadmap to founders.',
          fields: [
            { id: 'f-1', type: 'input', label: '01. Current Monthly Gross Media Spend (AED / $)', badge: 'METRIC', instructions: 'Average across Meta, TikTok, and Google Ads:', value: '$45,000 / mo' },
            { id: 'f-2', type: 'textarea', label: '02. Primary Operational Growth Bottleneck', badge: 'DEEP', instructions: 'Where does founder fatigue or supply friction bottleneck scale?', value: 'Custom formulation lead times require 8-week inventory forecasting.' }
          ]
        }
      ];

      newConnections = [
        { id: `conn-a1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' }
      ];
    } else if (templateKey === 'product-launch' || templateKey === 'launch') {
      title = 'Omnichannel DTC Product Launch Master Roadmap';
      const f1Id = `frame-launch-1-${Date.now()}`;
      const f2Id = `frame-launch-2-${Date.now()}`;
      const priceId = `pricing-launch-${Date.now()}`;
      const tblId = `table-launch-${Date.now()}`;
      const s1Id = `sticky-launch-1-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 640,
          height: 520,
          frameNumber: '01',
          titlePill: 'PRE-LAUNCH TEASE',
          headline: 'Anticipation & VIP',
          serifAccent: 'Waitlist Sprint',
          description: 'Building intense demand and exclusivity before public cart opening.',
          boxes: [
            { tag: 'SEEDING', tagColor: 'gold', title: 'Discreet Editor & Chemist Drop', content: 'Private delivery of 50 serialized wax-sealed sample vials to top dermatology and beauty editors under embargo.' },
            { tag: 'WAITLIST PORTAL', tagColor: 'blue', title: 'Password-Gated Early Access', content: 'Pre-launch password unlocks 24-hour private shopping window with numbered certificate of authenticity.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '02',
          titlePill: 'PUBLIC DROP DAY',
          headline: 'Multi-Channel Global',
          serifAccent: 'Activation',
          description: 'Coordinated omnichannel launch sprint across digital flagship and private client channels.',
          boxes: [
            { tag: 'PUBLIC RELEASE', tagColor: 'green', title: 'Omnichannel Cart Open', content: 'Digital flagship live, SMS broadcast to 12k VIP list, and 3-part documentary drop on Instagram & TikTok.' },
            { tag: 'SCARCITY CONTROL', tagColor: 'rose', title: 'Batch Allocation Cap', content: 'Initial batch strictly capped at 2,500 units to engineer genuine high-ticket sellout momentum.' }
          ]
        },
        {
          id: priceId,
          type: 'pricing',
          x: 1540,
          y: 120,
          width: 330,
          isFeatured: true,
          badge: 'LIMITED FOUNDER EDITION',
          currency: 'AED',
          figure: '1,250',
          period: 'Collector Box Set',
          features: [
            'Hand-Numbered Collector Presentation Box',
            'Full Active Barrier Repair Serum (50ml)',
            'Anodized Rose-Gold Micro-Sculpt Device',
            'Complimentary Concierge Refill Cartridge',
            'Private Masterclass with Lead Biochemist'
          ]
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 720,
          width: 780,
          title: 'Launch Master Countdown Schedule',
          badge: 'EXECUTION TIMELINE',
          headers: ['T-Minus', 'Milestone Deliverable', 'Execution Channel', 'Success Benchmark'],
          rows: [
            ['T-30 Days', 'Editor & Chemist NDA Seeding', 'Concierge White-Glove Mailer', '80%+ Organic Stories'],
            ['T-14 Days', 'Teaser Campaign & Waitlist Open', 'Meta Dark Ads + Reels', '15,000 Verified Emails'],
            ['T-24 Hours', 'Private VIP Password Cart Open', 'Exclusive SMS Drop', '$65k Gross in 24h'],
            ['Day 0', 'Full Public Global Launch', 'Omnichannel Flagship', 'Batch Sellout in 72h']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 930,
          y: 720,
          width: 290,
          height: 200,
          color: 'gold',
          rotation: -2,
          hasTape: true,
          header: 'INVENTORY PROTOCOL',
          content: 'Keep 150 serialized units held back in reserve for VIP replacements and celebrity stylist emergency requests.',
          footer: 'LOGISTICS SPRINT'
        }
      ];

      newConnections = [
        { id: `conn-l1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' },
        { id: `conn-l2`, from: f2Id, fromAnchor: 'right', to: priceId, toAnchor: 'left', style: 'dashed', color: 'green', label: '' }
      ];
    } else if (templateKey === 'influencer-collabs' || templateKey === 'creator') {
      title = 'Influencer & Creator Collaborations Engine';
      const f1Id = `frame-cr-1-${Date.now()}`;
      const f2Id = `frame-cr-2-${Date.now()}`;
      const tblId = `table-cr-${Date.now()}`;
      const scriptId = `script-cr-${Date.now()}`;
      const s1Id = `sticky-cr-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 640,
          height: 500,
          frameNumber: '01',
          titlePill: 'TALENT ARCHETYPES',
          headline: 'Creator Selection &',
          serifAccent: 'Brand Affinity',
          description: 'Categorizing creator talent by trust credibility rather than superficial vanity follower metrics.',
          boxes: [
            { tag: 'ARCHETYPE 1', tagColor: 'gold', title: 'Cosmetic Chemists & Derms', content: 'High-authority ingredient breakdowns, clinical claim validation, and microscopic skin texture testing.' },
            { tag: 'ARCHETYPE 2', tagColor: 'rose', title: 'Haute Parisian Stylists', content: 'Luxury morning vanity routines, tactile textures, and natural light French girl aesthetic.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 500,
          frameNumber: '02',
          titlePill: 'USAGE & LICENSING',
          headline: 'Paid Amplification &',
          serifAccent: 'Rights Governance',
          description: 'Maximizing asset longevity through 12-month paid whitelisting and dark-post syndication.',
          boxes: [
            { tag: 'WHITELISTING', tagColor: 'blue', title: 'Meta & TikTok Spark Authorization', content: 'Creators grant direct advertising permissions; ads run natively from creator handles with brand sponsor tag.' },
            { tag: 'PERFORMANCE BONUS', tagColor: 'green', title: 'Tiered RoAS Royalties', content: 'Base flat delivery fee + 4% gross revenue bonus when creative sustains > 3.2x blended RoAS over 30 days.' }
          ]
        },
        {
          id: scriptId,
          type: 'script',
          x: 1540,
          y: 120,
          width: 360,
          height: 180,
          content: '"We admire your scientific integrity. Our Parisian lab is releasing a barrier formulation and we would love to send you an unreleased batch for honest skin calibration — no mandatory post required."'
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1540,
          y: 350,
          width: 290,
          height: 180,
          color: 'mint',
          hasTape: true,
          header: 'BRIEFING MANDATE',
          content: 'No scripted bullet points. Creators must wear the formula for 10 consecutive days before recording raw b-roll.',
          footer: 'UGC PROTOCOL'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 680,
          width: 900,
          title: 'Active Creator Roster & Content Deliverables Pipeline',
          badge: 'TALENT ROSTER',
          headers: ['Creator Handle', 'Niche Archetype', 'Format', 'Deliverable Due', 'Fee (AED)', 'Status'],
          rows: [
            ['@camille.beaute', 'Haute Editorial', '3x 9:16 Reels', 'Oct 12', '4,500', 'Contract Signed'],
            ['@dr.nour.derma', 'Dermatologist', '2x Deep Dive Video', 'Oct 15', '8,000', 'Product Seeded'],
            ['@skinchem.atelier', 'Formulation Chemist', '1x Lab Breakdown', 'Oct 18', '6,200', 'In Production'],
            ['@leila.dubai', 'Lifestyle Luxury', '4x Story Sets', 'Oct 22', '5,000', 'Outreach Sent']
          ]
        }
      ];

      newConnections = [
        { id: `conn-c1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' }
      ];
    } else if (templateKey === 'skincare') {
      title = 'Skincare Formulation & Packaging Sprint';
      const f1Id = `frame-skin-1-${Date.now()}`;
      const f2Id = `frame-skin-2-${Date.now()}`;
      const tblId = `table-skin-${Date.now()}`;
      const s1Id = `sticky-skin-1-${Date.now()}`;
      const s2Id = `sticky-skin-2-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 640,
          height: 520,
          frameNumber: '01',
          titlePill: 'FORMULATION LAB',
          headline: 'Active Molecule',
          serifAccent: 'Architecture',
          description: 'Designing clinical potency ratios, liposomal delivery vehicles, and active stability profiles.',
          boxes: [
            { tag: 'HERO ACTIVE', tagColor: 'gold', title: '5.2% Bio-Identical Peptide Complex', content: 'Precision micro-encapsulated copper peptides stimulating cellular collagen synthesis without irritation.' },
            { tag: 'LIPID CARRIER', tagColor: 'green', title: 'Botanical Olive Squalane Carrier', content: 'Biocompatible lipid bilayer mimicking natural skin sebum for rapid trans-epidermal absorption.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 520,
          frameNumber: '02',
          titlePill: 'HAUTE PACKAGING',
          headline: 'Tactile Vessel & Glass',
          serifAccent: 'Engineering',
          image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
          description: 'Bespoke industrial design shielding active chemistry while delivering luxurious tactile haptics.',
          boxes: [
            { tag: 'GLASS VESSEL', tagColor: 'noir', title: 'Frosted French Flint Glass', content: 'Heavy 40% recycled glass with UV-opaque interior glaze to prevent photo-chemical degradation.' },
            { tag: 'DISPENSER', tagColor: 'gold', title: 'Anodized Champagne Gold Pipette', content: '0.5ml precision metered dose dropper with airtight silicone gasket seal.' }
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1540,
          y: 120,
          width: 280,
          height: 190,
          color: 'yellow',
          hasTape: true,
          header: 'CLINICAL TRIAL',
          content: '56-day double-blind clinical study required for "Clinically Proven 42% Reduction in Fine Lines" claim.',
          footer: 'REGULATORY COMPLIANCE'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1540,
          y: 350,
          width: 280,
          height: 190,
          color: 'mint',
          hasTape: true,
          header: 'SUSTAINABILITY',
          content: '100% Forest Stewardship Council (FSC) certified uncoated paper for folding cartons with vegetable dye inks.',
          footer: 'ECO PROTOCOL'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 700,
          width: 860,
          title: 'Stability, Safety & Regulatory Testing Protocols',
          badge: 'LAB TESTING MATRIX',
          headers: ['Testing Phase', 'Protocol Parameter', 'Duration', 'Regulatory Standard', 'Status'],
          rows: [
            ['Phase 01: Microbiology', 'Preservative Efficacy Testing (PET)', '28 Days', 'ISO 11930', 'Passed'],
            ['Phase 02: Thermal Stability', 'Accelerated Aging at 45°C / 75% RH', '12 Weeks', 'EU Cosmetics Reg 1223/2009', 'Week 8 In Progress'],
            ['Phase 03: Dermatological', 'Human Repeat Insult Patch Test (HRIPT)', '6 Weeks', 'Dermatologist Hypoallergenic', 'Recruiting Cohort'],
            ['Phase 04: Packaging Leak', 'Vacuum Decay & Inversion Chamber', '7 Days', 'ASTM D4991', 'Approved']
          ]
        }
      ];

      newConnections = [
        { id: `conn-s1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' }
      ];
    } else if (templateKey === 'moodboard') {
      title = 'Haute Brand Identity Moodboard';
      const f1Id = `frame-mb-1-${Date.now()}`;
      const f2Id = `frame-mb-2-${Date.now()}`;
      const s1Id = `sticky-mb-1-${Date.now()}`;
      const s2Id = `sticky-mb-2-${Date.now()}`;
      const shapeId = `shape-mb-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 620,
          height: 520,
          frameNumber: '01',
          titlePill: 'VISUAL UNIVERSE',
          headline: 'Haute Atelier',
          serifAccent: 'Aesthetic Palette',
          image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1200&auto=format&fit=crop',
          description: 'Core design tokens, tactile paper materiality, and editorial color swatches.',
          boxes: [
            { tag: 'COLOR TOKENS', tagColor: 'gold', title: 'Champagne Gold & Noir', content: '#E2C799 (Warm Champagne), #C5A880 (Atelier Bronze), #FAF7F2 (Alabaster), #080706 (Obsidian Noir).' },
            { tag: 'TYPOGRAPHY PAIRING', tagColor: 'rose', title: 'Cormorant Garamond + Plus Jakarta', content: 'Graceful high-contrast serifs for editorial headlines anchored by modern geometric grotesk for UI & body.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 780,
          y: 120,
          width: 620,
          height: 520,
          frameNumber: '02',
          titlePill: 'EDITORIAL DIRECTION',
          headline: 'Architectural Raking',
          serifAccent: 'Light & Shadows',
          image: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1200&auto=format&fit=crop',
          description: 'Art direction guidelines for photography, packaging flatlays, and tactile textures.',
          boxes: [
            { tag: 'LIGHTING', tagColor: 'blue', title: 'Low Sun Raking Light', content: 'Natural directional morning light casting long soft architectural shadows across limestone and travertine.' },
            { tag: 'MATERIALITY', tagColor: 'gold', title: 'Uncoated Cotton & Cold Bronze', content: 'Rich heavy card stocks with blind debossing paired with brushed architectural metallic accents.' }
          ]
        },
        {
          id: shapeId,
          type: 'shape',
          shapeType: 'circle',
          x: 1460,
          y: 140,
          width: 200,
          height: 200,
          text: 'POLISH\nPARIS • DUBAI\nATELIER',
          zIndex: 20
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1450,
          y: 380,
          width: 270,
          height: 180,
          color: 'noir',
          hasTape: true,
          header: 'BRAND RULE',
          content: 'No synthetic rainbow gradients or harsh primary colors. Every asset must feel museum-grade and bespoke.',
          footer: 'HAUTE ATELIER'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1450,
          y: 600,
          width: 270,
          height: 180,
          color: 'rose',
          hasTape: true,
          header: 'TACTILE DETAIL',
          content: 'Blind embossing on thick Alabaster paper stock. Gold foil accents used sparingly at < 5% surface area.',
          footer: 'PRINT SPEC'
        }
      ];

      newConnections = [
        { id: `conn-mb1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' }
      ];
    } else if (templateKey === 'mindmap') {
      title = 'POLISH Sovereign Brand Architecture Mind Map';
      const rootId = `shape-root-${Date.now()}`;
      const branch1Id = `sticky-b1-${Date.now()}`;
      const branch2Id = `sticky-b2-${Date.now()}`;
      const branch3Id = `sticky-b3-${Date.now()}`;
      const branch4Id = `sticky-b4-${Date.now()}`;

      newElements = [
        {
          id: rootId,
          type: 'shape',
          shapeType: 'circle',
          x: 750,
          y: 400,
          width: 220,
          height: 220,
          text: 'POLISH ATELIER\nSovereign Brand\nArchitecture',
          zIndex: 20
        },
        {
          id: branch1Id,
          type: 'sticky',
          color: 'rose',
          x: 1100,
          y: 200,
          width: 280,
          hasTape: true,
          header: 'AUDIENCE & PERSONA',
          content: 'Discerning aesthetic clientele valuing clinical biochemistry and third-party laboratory claim validation over superficial hype.',
          footer: 'BRANCH 01'
        },
        {
          id: branch2Id,
          type: 'sticky',
          color: 'yellow',
          x: 1100,
          y: 560,
          width: 280,
          hasTape: true,
          header: 'OFFER ARCHITECTURE',
          content: '3-Tier Clinical Retainer (AED 28,000 / mo + 8% growth equity) with exclusive access to POLISH Strategy Studio.',
          footer: 'BRANCH 02'
        },
        {
          id: branch3Id,
          type: 'sticky',
          color: 'blue',
          x: 360,
          y: 560,
          width: 280,
          hasTape: true,
          header: 'CONTENT & MEDIA',
          content: 'Dynamic creative testing (3:2:2 framework), macro texture thumbstops, and high-conversion scientific advertorial presells.',
          footer: 'BRANCH 03'
        },
        {
          id: branch4Id,
          type: 'sticky',
          color: 'mint',
          x: 360,
          y: 200,
          width: 280,
          hasTape: true,
          header: 'CLINICAL & PACKAGING',
          content: 'ISO 11930 PET preservative testing, French frosted flint glass vessels, and anodized champagne gold metered droppers.',
          footer: 'BRANCH 04'
        }
      ];

      newConnections = [
        { id: `conn-1`, from: rootId, fromAnchor: 'right', to: branch1Id, toAnchor: 'left', style: 'curved', color: 'rose', label: '' },
        { id: `conn-2`, from: rootId, fromAnchor: 'bottom', to: branch2Id, toAnchor: 'left', style: 'curved', color: 'gold', label: '' },
        { id: `conn-3`, from: rootId, fromAnchor: 'bottom', to: branch3Id, toAnchor: 'right', style: 'curved', color: 'blue', label: '' },
        { id: `conn-4`, from: rootId, fromAnchor: 'left', to: branch4Id, toAnchor: 'right', style: 'curved', color: 'green', label: '' }
      ];
    } else if (templateKey === 'planner') {
      title = 'Weekly Luxury Beauty Executive Sprint';
      const days = [
        { name: 'Monday', title: 'Pipeline & Media Calibration', boxTitle: 'ASC Liquidity & Spend Audit', boxContent: 'Review Meta ASC & TikTok Spark ROAS. Reallocate spend to winners with blended MER > 3.8x.', outcome: 'Media budgets balanced with zero algorithmic shock.' },
        { name: 'Tuesday', title: 'Creative Direction & Hook Testing', boxTitle: '12 Raw UGC Cuts Review', boxContent: 'Audit b-roll lighting, audio mastering, and microscopic dropper texture holds with creator talent.', outcome: '6 dynamic creative variations approved for sandbox.' },
        { name: 'Wednesday', title: 'Formulation & Clinical Sync', boxTitle: 'Biochemistry Stability Review', boxContent: 'Review accelerated aging reports at 45°C and sample batch 04 frosted flint glass seals.', outcome: 'EU 1223/2009 compliance dossier signed off.' },
        { name: 'Thursday', title: 'Retention & Private Concierge', boxTitle: 'Klaviyo Replenishment Cadence', boxContent: 'Optimize 45-day automated refill triggers and inspect VIP WhatsApp high-roller voice memos.', outcome: 'Repeat customer 90-day LTV pace lifted to AED 420+.' },
        { name: 'Friday', title: 'Unit Economics & Board Sign-off', boxTitle: 'Weekly Contribution Margin', boxContent: 'Audit gross revenue, net margins, customer acquisition costs, and 60-day inventory runway.', outcome: 'Executive board report transmitted to stakeholders.' }
      ];
      const colors = ['yellow', 'rose', 'blue', 'mint', 'noir'];
      newElements = [];
      newConnections = [];

      days.forEach((day, idx) => {
        const frameId = `frame-day-${idx}-${Date.now()}`;
        const stickyId = `sticky-task-${idx}-${Date.now()}`;
        const startX = 140 + idx * 430;

        newElements.push({
          id: frameId,
          type: 'frame',
          x: startX,
          y: 160,
          width: 390,
          height: 600,
          frameNumber: `0${idx + 1}`,
          titlePill: day.name.toUpperCase(),
          headline: day.title,
          description: `Executive operations and non-negotiable milestones for ${day.name}.`,
          boxes: [
            { tag: 'DEEP WORK SPRINT', tagColor: 'gold', title: day.boxTitle, content: day.boxContent }
          ]
        });

        newElements.push({
          id: stickyId,
          type: 'sticky',
          color: colors[idx % colors.length],
          x: startX + 50,
          y: 480,
          width: 290,
          hasTape: true,
          header: 'DAILY NON-NEGOTIABLE',
          content: day.outcome,
          footer: `${day.name.toUpperCase()} CADENCE`
        });
      });
    } else if (templateKey === 'polish-cosmetics-launch' || templateKey === 'cosmetics-launch') {
      title = 'POLISH • Haute Formulation & Cosmetic Product Launch Blueprint';
      const f1Id = `frame-pcl-1-${Date.now()}`;
      const f2Id = `frame-pcl-2-${Date.now()}`;
      const cpId = `cp-pcl-${Date.now()}`;
      const tableId = `tbl-pcl-${Date.now()}`;
      const metricId = `metric-pcl-${Date.now()}`;
      const stickyId = `sticky-pcl-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 100,
          width: 580,
          height: 600,
          zIndex: 10,
          frameNumber: '01',
          titlePill: 'PHASE 01 • FORMULATION & CLAIMS',
          headline: 'Bio-Active R&D &',
          serifAccent: 'Clinical Proof',
          description: 'Validating proprietary cosmetic actives and establishing undeniable efficacy proof before commercial launch.',
          boxes: [
            {
              tag: 'FORMULATION ENGINE',
              tagColor: 'gold',
              title: 'Liposomal Delivery System',
              content: 'Patented lipid encapsulation protecting active vitamin molecules from photolytic oxidation, increasing cellular bioavailability by 340%.'
            },
            {
              tag: 'REGULATORY CLEARANCE',
              tagColor: 'blue',
              title: 'EU CPSR & US FDA Cosmetic Dossier',
              content: 'Full toxicological assessment, 90-day stability trials, and preservative challenge testing (PET) fully certified for global distribution.'
            }
          ]
        },
        {
          id: cpId,
          type: 'clinical-proof',
          x: 720,
          y: 100,
          width: 520,
          zIndex: 12,
          title: 'Hero SKU Bio-Efficacy Results',
          labName: 'PARISIAN DERM CLINICAL LAB',
          protocol: '28-Day Blinded Clinical Cohort • n = 54 Female Subjects • Age 28–55',
          stat1: '96%',
          claim1: 'Demonstrated immediate reduction in skin surface erythema & redness within 15 minutes of application.',
          stat2: '89%',
          claim2: 'Instrumental corneometry recorded continuous barrier hydration over 72 consecutive hours.'
        },
        {
          id: f2Id,
          type: 'frame',
          x: 100,
          y: 740,
          width: 580,
          height: 560,
          zIndex: 10,
          frameNumber: '02',
          titlePill: 'PHASE 02 • LUXURY PACKAGING & UNBOXING',
          headline: 'Tactile Architecture &',
          serifAccent: 'Sensory Ritual',
          description: 'Engineering the unboxing experience to command a 4x price multiplier and drive organic viral UGC.',
          boxes: [
            {
              tag: 'VESSEL SPECIFICATION',
              tagColor: 'gold',
              title: 'UV-Coated Frosted Glass Flacon',
              content: 'Heavyweight flint glass with custom pipette and diamond-faceted collar. Shields photosensitive formulation from ambient degradation.'
            },
            {
              tag: 'SECONDARY CARTON',
              tagColor: 'rose',
              title: 'Rigid Soft-Touch Slide Box',
              content: 'FSC-certified 400gsm cotton paper with hot-stamped gold foil logo and blind-debossed formula batch certificate.'
            }
          ]
        },
        {
          id: tableId,
          type: 'table',
          x: 720,
          y: 660,
          width: 820,
          zIndex: 12,
          title: '90-Day Launch Sequence & Milestones',
          subtitle: 'From Formulation Freeze to VIP Drop Sell-Out',
          headers: ['Sprint Week', 'Production Phase', 'Marketing Engine', 'Target Metric', 'Contingency Protocol'],
          rows: [
            ['W-8 to W-6', 'Clinical Trials & CPSR Dossier', 'Founder R&D Behind-the-Scenes VSL', '5,000 VIP Waitlist Signups', 'Fast-Track Lab Stability Batch'],
            ['W-5 to W-3', 'Secondary Packaging & Carton Assembly', '50 Tier-1 Creator Gifting & Seeding', '35 Organic Unboxing Videos', 'Over-Air Express Airfreight'],
            ['W-2 to W-1', 'DTC Pre-Order Gate & Shopify Stress Test', 'Private VIP Early-Access SMS Drop', '100% Allocation Reserved', 'Waitlist Expansion Waitgate'],
            ['Launch Day', 'General Public DTC Release', 'Advantage+ & Spark Ads Scaling', '$120k First 48-Hour GMV', 'Pre-Allocate Wave 2 Production']
          ]
        },
        {
          id: metricId,
          type: 'metric',
          x: 1280,
          y: 100,
          width: 260,
          zIndex: 15,
          title: 'LAUNCH REVENUE TARGET',
          badge: 'SELL-OUT RUNWAY',
          deltaColor: 'tag-green',
          figure: '$185,000',
          subtitle: 'First 14-Day DTC Launch Allocation (2,500 Units)'
        },
        {
          id: stickyId,
          type: 'sticky',
          x: 1280,
          y: 290,
          width: 260,
          color: 'gold',
          hasTape: true,
          header: 'LAUNCH NON-NEGOTIABLE',
          content: 'Never launch a single SKU without an immediate 3-item ritual bundle option. Routine bundles increase AOV from $68 to $174 on launch day.',
          footer: 'HAUTE ATELIER RULE'
        }
      ];

      newConnections = [
        {
          id: `conn-pcl-1-${Date.now()}`,
          from: f1Id,
          to: cpId,
          fromPort: 'right',
          toPort: 'left',
          style: 'curved',
          color: '#E2C799',
          label: 'Efficacy Proof'
        },
        {
          id: `conn-pcl-2-${Date.now()}`,
          from: cpId,
          to: metricId,
          fromPort: 'right',
          toPort: 'left',
          style: 'dashed',
          color: '#C5A880',
          label: 'Revenue Multiplier'
        },
        {
          id: `conn-pcl-3-${Date.now()}`,
          from: f1Id,
          to: f2Id,
          fromPort: 'bottom',
          toPort: 'top',
          style: 'curved',
          color: '#E2C799',
          label: 'Physical Vessel'
        },
        {
          id: `conn-pcl-4-${Date.now()}`,
          from: f2Id,
          to: tableId,
          fromPort: 'right',
          toPort: 'left',
          style: 'solid',
          color: '#38BDF8',
          label: 'Execution Roadmap'
        }
      ];
    } else if (templateKey === 'polish-skincare-regimen' || templateKey === 'skincare-regimen') {
      title = 'POLISH • DTC Skincare Regimen & Replenishment LTV Blueprint';
      const r1Id = `rs-1-${Date.now()}`;
      const r2Id = `rs-2-${Date.now()}`;
      const r3Id = `rs-3-${Date.now()}`;
      const r4Id = `rs-4-${Date.now()}`;
      const tblId = `tbl-psr-${Date.now()}`;
      const metricId = `metric-psr-${Date.now()}`;

      newElements = [
        {
          id: r1Id,
          type: 'routine-step',
          x: 80,
          y: 120,
          width: 380,
          zIndex: 12,
          stepBadge: 'STEP 01 • PREPARE',
          timeBadge: 'AM & PM DAILY',
          title: 'Botanical Lipid-Restoring Cleanser',
          subtitle: 'pH 5.4 Low-Foam Gel-Oil Emulsion',
          actives: '• Oat Seed Beta-Glucan\n• 1.5% Salicylic Acid Encapsulated\n• Centella Asiatica & Glycerin Complex',
          target: 'Dissolve impurities while preserving intercellular lipid cement.',
          aovLift: 'Solo: $48 | Bundled AOV: +$48'
        },
        {
          id: r2Id,
          type: 'routine-step',
          x: 500,
          y: 120,
          width: 380,
          zIndex: 12,
          stepBadge: 'STEP 02 • TREAT',
          timeBadge: 'AM & PM ESSENTIAL',
          title: 'Cellular Peptide Renewal Elixir',
          subtitle: 'Ultra-Potent High-Absorption Serum',
          actives: '• Copper Tripeptide-1 (GHK-Cu)\n• 5% Niacinamide & Ectoin\n• 3 Molecular Weight Hyaluronic Matrix',
          target: 'Stimulates collagen synthesis and rapidly accelerates skin barrier renewal.',
          aovLift: 'Solo: $84 | Hero SKU (62% 1st-Time CVR)'
        },
        {
          id: r3Id,
          type: 'routine-step',
          x: 920,
          y: 120,
          width: 380,
          zIndex: 12,
          stepBadge: 'STEP 03 • HYDRATE',
          timeBadge: 'PM HEALING COCOON',
          title: 'Ceramide Lamellar Barrier Crème',
          subtitle: 'Physiological Bio-Identical Lipid Shield',
          actives: '• Ceramides NP, AP, EOP (3:1:1 Ratio)\n• Plant-Derived Squalane (10%)\n• Cholesterol & Free Fatty Acids',
          target: 'Locks in serum bio-actives and prevents nocturnal transepidermal water loss.',
          aovLift: 'Solo: $72 | +28% Basket Cross-Sell'
        },
        {
          id: r4Id,
          type: 'routine-step',
          x: 1340,
          y: 120,
          width: 380,
          zIndex: 12,
          stepBadge: 'STEP 04 • SHIELD',
          timeBadge: 'AM FINAL TOUCH',
          title: 'Silk Mineral SPF 50+ Invisible Veil',
          subtitle: '100% Non-Nano Zinc Oxide Fluid',
          actives: '• 18% Non-Nano Zinc Oxide\n• Astaxanthin & Green Tea Polyphenols\n• Bisabolol Calming Agent',
          target: 'Full UVA/UVB/HEV Blue Light protection with zero white cast or greasy finish.',
          aovLift: 'Solo: $56 | High-Retention Auto-Replenish'
        },
        {
          id: tblId,
          type: 'table',
          x: 80,
          y: 640,
          width: 980,
          zIndex: 12,
          title: 'DTC Replenishment Cadence & 90-Day Retention Architecture',
          subtitle: 'Transforming 1-Time Routine Buyers into Lifetime Subscribers',
          headers: ['Cohort Lifecycle', 'Automated Concierge Trigger', 'Fulfillment Window', 'Replenishment Offer', 'Expected Churn Target'],
          rows: [
            ['Day 1–3', 'Post-Purchase Usage Protocol Video (SMS)', 'Delivered & Unboxed', 'Skin Journal Invitation', '< 1.5% Return Rate'],
            ['Day 14–18', 'Barrier Adaptation Check-in Callout', 'Usage Check (Halfway mark)', 'Personalized Regimen Adjustment', '< 3.0% Inactive Rate'],
            ['Day 45–50', 'Automated Replenishment Alert (SMS / Email)', 'Bottle at 20% capacity', '1-Click Refill Refreshed (15% Off Sub)', '> 58% Subscription Opt-In'],
            ['Day 90+', 'VIP Loyalty Milestone & Seasonal Add-on', 'Quarterly Refill Renewal', 'Exclusive Formulation Beta Sample', '> 4.2x LTV Lift vs Solo SKU']
          ]
        },
        {
          id: metricId,
          type: 'metric',
          x: 1100,
          y: 640,
          width: 300,
          zIndex: 15,
          title: 'ROUTINE BUNDLE AOV',
          badge: '+142% LTV BOOST',
          deltaColor: 'tag-green',
          figure: '$198 AOV',
          subtitle: 'Complete 4-Piece Regimen (vs $58 Single SKU)'
        }
      ];

      newConnections = [
        {
          id: `conn-psr-1-${Date.now()}`,
          from: r1Id,
          to: r2Id,
          fromPort: 'right',
          toPort: 'left',
          style: 'curved',
          color: '#E2C799',
          label: 'Activates'
        },
        {
          id: `conn-psr-2-${Date.now()}`,
          from: r2Id,
          to: r3Id,
          fromPort: 'right',
          toPort: 'left',
          style: 'curved',
          color: '#E2C799',
          label: 'Seals'
        },
        {
          id: `conn-psr-3-${Date.now()}`,
          from: r3Id,
          to: r4Id,
          fromPort: 'right',
          toPort: 'left',
          style: 'curved',
          color: '#E2C799',
          label: 'Protects'
        },
        {
          id: `conn-psr-4-${Date.now()}`,
          from: r2Id,
          to: tblId,
          fromPort: 'bottom',
          toPort: 'top',
          style: 'dashed',
          color: '#34D399',
          label: 'Replenishment Engine'
        }
      ];
    } else if (templateKey === 'polish-parfumerie-prestige' || templateKey === 'parfumerie-prestige') {
      title = 'POLISH • Haute Parfumerie Prestige Positioning Blueprint';
      const opId = `op-ppp-${Date.now()}`;
      const f1Id = `frame-ppp-1-${Date.now()}`;
      const tblId = `tbl-ppp-${Date.now()}`;
      const metricId = `metric-ppp-${Date.now()}`;

      newElements = [
        {
          id: opId,
          type: 'olfactory-pyramid',
          x: 100,
          y: 100,
          width: 500,
          zIndex: 12,
          title: 'Oud Impérial & Rose Centifolia',
          concentration: 'EXTRAIT DE PARFUM (32% ESSENCE)',
          tagline: 'Sensual Rare Amber, Grasse Rose & Aged Cambodian Agarwood',
          topNotes: 'Italian Calabrian Bergamot, Elemi Resin, Pink Peppercorn',
          heartNotes: 'Grasse Rose Centifolia Absolute, Saffron Stigmas, Orris Concrete',
          baseNotes: '30-Year Aged Wild Cambodian Oud, Ambergris Flakes, Bourbon Vanilla Pods',
          longevity: '18+ Hours Sillage',
          voucher: '$38 Discovery Set = 100% Credit on 100ml Flacon'
        },
        {
          id: f1Id,
          type: 'frame',
          x: 640,
          y: 100,
          width: 580,
          height: 560,
          zIndex: 10,
          frameNumber: '01',
          titlePill: 'DISCOVERY FLYWHEEL',
          headline: 'Sample-to-Flacon',
          serifAccent: 'Voucher Conversion',
          description: 'Eliminating the digital blind-buy barrier with self-liquidating discovery sets and 100% credit bouncebacks.',
          boxes: [
            {
              tag: 'ZERO-RISK ACQUISITION',
              tagColor: 'gold',
              title: 'The 5-Vial Discovery Wardrobe ($38)',
              content: 'Includes 5 x 2ml spray vials presented in a velvet luxury pouch. Front-end ad spend breaks even at 1.1x ROAS on initial sample orders.'
            },
            {
              tag: 'HIGH-TICKET BOUNCEBACK',
              tagColor: 'blue',
              title: '30-Day 100% Rebate Voucher Code',
              content: 'Buyers receive a unique $38 code towards any 100ml flacon ($240 MSRP). Converts 38.4% of sample buyers to full flacon owners within 21 days.'
            }
          ]
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 690,
          width: 900,
          zIndex: 12,
          title: 'Prestige Distribution Channels & Margin Architecture',
          subtitle: 'Balancing DTC Scalability with Exclusive Boutique Placement',
          headers: ['Channel Tier', 'Placement Venue', 'Gross Margin %', 'Average Order Value (AOV)', 'Strategic Purpose'],
          rows: [
            ['DTC Atelier Web', 'Official Brand Boutique (Global)', '84% Margin', '$215 AOV', 'Direct relationship, maximum LTV, subscriber data'],
            ['Discovery Sampling', 'Direct Response Meta/TikTok Ads', '52% Margin', '$42 AOV', 'Customer acquisition front-end, CAC neutralization'],
            ['Selective Retail', 'Le Bon Marché, Harrods, Saks Fifth', '48% Wholesale', '$280 AOV', 'Global cultural prestige, credibility halo, foot traffic'],
            ['VIP Private Salon', 'Private Concierge & Trunk Shows (Dubai)', '88% Margin', '$850 AOV', 'Ultra-high-ticket private bespoke formulation commissions']
          ]
        },
        {
          id: metricId,
          type: 'metric',
          x: 1040,
          y: 690,
          width: 280,
          zIndex: 15,
          title: 'FULL FLACON LTV',
          badge: 'PRESTIGE BENCHMARK',
          deltaColor: 'tag-green',
          figure: '$380 LTV',
          subtitle: 'Average 12-Month Customer Value (Discovery + 1.6 Flacons)'
        }
      ];

      newConnections = [
        {
          id: `conn-ppp-1-${Date.now()}`,
          from: opId,
          to: f1Id,
          fromPort: 'right',
          toPort: 'left',
          style: 'curved',
          color: '#E2C799',
          label: 'Olfactory Hook'
        },
        {
          id: `conn-ppp-2-${Date.now()}`,
          from: f1Id,
          to: tblId,
          fromPort: 'bottom',
          toPort: 'top',
          style: 'dashed',
          color: '#C5A880',
          label: 'Commercial Rails'
        }
      ];
    } else if (templateKey === 'polish-ugc-beauty' || templateKey === 'ugc-beauty') {
      title = 'POLISH • Beauty Creator & UGC Video Performance Scaling Blueprint';
      const ugc1Id = `ugc-pub-1-${Date.now()}`;
      const ugc2Id = `ugc-pub-2-${Date.now()}`;
      const tblId = `tbl-pub-${Date.now()}`;
      const metricId = `metric-pub-${Date.now()}`;

      newElements = [
        {
          id: ugc1Id,
          type: 'ugc-brief',
          x: 80,
          y: 100,
          width: 460,
          zIndex: 12,
          platform: 'TIKTOK & META SPARK ADS',
          aspect: '9:16 VERTICAL 4K',
          title: 'Extreme Macro Texture Melt',
          conceptTag: 'ANGLE: SENSORY ASMR & BARRIER SOOTHING',
          hookText: 'Macro 4K dropper release onto cheekbone with ambient ASMR droplet sound. Glass-skin radiance in golden-hour daylight.',
          agitationText: '"Stop buying 6 moisturizers that pill under makeup. My esthetician told me this one clinical ceramide matrix replaces them all."',
          demoText: 'Half-face real-time application. Immediate velvety matte blur with 0% stickiness or white cast on deep skin tones.',
          ctaText: 'Shop the 3-Piece Clinical Starter Kit before the laboratory batch caps. 100% empty-bottle refund guarantee.',
          thumbstop: '42%+',
          cpa: '$16.80'
        },
        {
          id: ugc2Id,
          type: 'ugc-brief',
          x: 580,
          y: 100,
          width: 460,
          zIndex: 12,
          platform: 'INSTAGRAM REELS & STORIES',
          aspect: '9:16 VERTICAL',
          title: 'The 14-Day Derm Split-Face Test',
          conceptTag: 'ANGLE: CLINICAL CREDIBILITY & BEFORE/AFTER',
          hookText: 'Side-by-side high-resolution camera zoom showing texture change on day 1 vs day 14. Split screen with digital timer.',
          agitationText: '"I was ready to spend $1,200 on laser treatments for hyperpigmentation until my dermatologist told me to test this active essence."',
          demoText: 'Hands holding genuine lab testing paperwork showing 96% clinical efficacy, followed by live unboxing of the flacon.',
          ctaText: 'Click link to read the independent clinical report and secure the introductory launch voucher.',
          thumbstop: '37%+',
          cpa: '$19.20'
        },
        {
          id: tblId,
          type: 'table',
          x: 80,
          y: 720,
          width: 960,
          zIndex: 12,
          title: '3-Tier Beauty Creator Seeding & Paid Whitelisting Architecture',
          subtitle: 'From Unpaid Gifting to High-Volume Spark Ads Scaling',
          headers: ['Creator Tier', 'Follower Range', 'Seeding Compensation', 'Content Deliverable', 'Usage Rights & Scaling'],
          rows: [
            ['Tier 1: Micro Skin Nerds', '5k — 30k', 'Complimentary VIP Gift Box + 15% RevShare', '2 Raw Organic Reels / TikToks', 'Organic social proof & review quotes'],
            ['Tier 2: Pro Estheticians & Chemists', '30k — 150k', '$400 — $1,200 Flat + Product Package', '1 Dedicated Deep-Dive Formulation Review', '30-Day Paid Whitelisting on Meta & TikTok'],
            ['Tier 3: Category Tastemakers', '150k — 800k', '$2,500 — $6,000 + Ongoing Retainer', '1 Hero Routine Inclusion + 2 Story Frames', '90-Day Dark-Posting Spark Ads + Landing Page Face']
          ]
        },
        {
          id: metricId,
          type: 'metric',
          x: 1080,
          y: 720,
          width: 300,
          zIndex: 15,
          title: 'PAID ROAS FROM UGC',
          badge: 'META & TIKTOK SPARK',
          deltaColor: 'tag-green',
          figure: '4.4x Blended MER',
          subtitle: 'Tested across 18 Creator Variations in ASC Sandbox'
        }
      ];

      newConnections = [
        {
          id: `conn-pub-1-${Date.now()}`,
          from: ugc1Id,
          to: tblId,
          fromPort: 'bottom',
          toPort: 'top',
          style: 'curved',
          color: '#E2C799',
          label: 'Script Specimen'
        },
        {
          id: `conn-pub-2-${Date.now()}`,
          from: ugc2Id,
          to: tblId,
          fromPort: 'bottom',
          toPort: 'top',
          style: 'curved',
          color: '#E2C799',
          label: 'Clinical Specimen'
        },
        {
          id: `conn-pub-3-${Date.now()}`,
          from: tblId,
          to: metricId,
          fromPort: 'right',
          toPort: 'left',
          style: 'dashed',
          color: '#34D399',
          label: 'ROAS Lift'
        }
      ];
    } else {
      const starter = getBuiltinStarterBoard();
      title = starter.title;
      newElements = starter.elements;
      newConnections = starter.connections;
    }

    return {
      title,
      elements: newElements,
      connections: newConnections
    };
  }

  function listTemplates() {
    return [
      { id: "starter", name: "Executive Retainer Blueprint", category: "Agency Core" },
      { id: "blank", name: "Blank Haute Canvas", category: "Custom" },
      { id: "polish-cosmetics-launch", name: "Haute Formulation & Product Launch", category: "Haute Atelier" },
      { id: "polish-skincare-regimen", name: "DTC Skincare Regimen & Replenishment LTV", category: "Haute Atelier" },
      { id: "polish-parfumerie-prestige", name: "Haute Parfumerie Prestige Positioning", category: "Haute Atelier" },
      { id: "polish-ugc-beauty", name: "Beauty Creator & UGC Performance Scaling", category: "Haute Atelier" },
      { id: "hormozi", name: "$100M Grand Slam Offer & Value Equation", category: "Advisory" },
      { id: "ottley", name: "Autonomous Systems & AI Pipeline", category: "Automation" },
      { id: "bradley", name: "Bespoke Inbound Pipeline Engine", category: "Acquisition" },
      { id: "morgan", name: "Executive Outbound & Direct Access", category: "Sales" },
      { id: "ajsmart", name: "4-Day Strategic Design Sprint", category: "Advisory" },
      { id: "isenberg", name: "Boutique Community Flywheel", category: "Retention" },
      { id: "scaling-blueprint", name: "DTC Beauty Scaling Architecture", category: "Growth" },
      { id: "retention-flywheel", name: "VIP Customer Lifetime Value Flywheel", category: "Retention" },
      { id: "personal-branding", name: "Founder Authority & Haute Aura", category: "Brand" },
      { id: "meta-tiktok-ads", name: "Paid Media ROAS & Performance Matrix", category: "Paid Media" },
      { id: "audit", name: "Full DTC Friction & Conversion Audit", category: "Diagnostics" },
      { id: "product-launch", name: "Haute Product Launch Sequence", category: "Launch" },
      { id: "influencer-collabs", name: "Creator Network Seeding & UGC Pipeline", category: "Creators" },
      { id: "skincare", name: "Clinical Skincare Brand Architecture", category: "Cosmetics" },
      { id: "moodboard", name: "Editorial Moodboard & Visual Identity", category: "Creative" },
      { id: "mindmap", name: "Strategic Architecture Mindmap", category: "Strategy" },
      { id: "planner", name: "90-Day Executive Cadence Planner", category: "Planning" }
    ];
  }

  return {
    getStarterBoard: getBuiltinStarterBoard,
    getBuiltinStarterBoard,
    getTemplate,
    listTemplates
  };
})();
