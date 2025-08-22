import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";

/************************************
 * PHOENIX PLAN — Unified App (Vite + React + Tailwind + p5 + SVG)
 * Combines: Daily-pay planner, dashboard (windfalls & one-time expenses), and guided curriculum.
 * - No crypto / import.meta pitfalls
 * - p5 loaded safely from CDN (works in sandbox & Vite)
 * - Pure-SVG mini charts (no Chart.js dependency)
 *
 * Quick start (new project):
 *   npm create vite@latest phoenix-plan -- --template react
 *   cd phoenix-plan && npm i
 *   npm i -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
 *   # add to index.css: @tailwind base; @tailwind components; @tailwind utilities;
 *   npm run dev
 ************************************/

/************************************
 * Utilities
 ************************************/
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const fmtNumber = (v) => (Number.isFinite(v) ? v : 0);
const parseMoney = (str) => { const n = Number(String(str).replace(/[^0-9.\-]/g, "")); return Number.isFinite(n) ? n : 0; };

function daysInMonth(d = new Date()) { const y = d.getFullYear(); const m = d.getMonth(); return new Date(y, m + 1, 0).getDate(); }

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      return raw ? JSON.parse(raw) : (typeof initialValue === 'function' ? initialValue() : initialValue);
    } catch { return typeof initialValue === 'function' ? initialValue() : initialValue; }
  });
  useEffect(() => { try { if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(value)); } catch {} }, [key, value]);
  return [value, setValue];
}

/************************************
 * p5 Embers Background (safe CDN loader)
 ************************************/
function loadP5FromCDN() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no-window'));
  if (window.p5) return Promise.resolve(window.p5);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/p5@1.11.1/lib/p5.min.js';
    s.async = true;
    s.onload = () => (window.p5 ? resolve(window.p5) : reject(new Error('p5-not-global')));
    s.onerror = () => reject(new Error('p5-cdn-failed'));
    document.head.appendChild(s);
  });
}

function EmbersBG({ active }) {
  const hostRef = useRef(null);
  useEffect(() => {
    let cleanup = () => {};
    if (!active) return cleanup;
    let mounted = true;
    loadP5FromCDN()
      .then((P5) => {
        if (!mounted) return;
        const inst = new P5((p) => {
          const sparks = [];
          p.setup = () => { const c = p.createCanvas(p.windowWidth, 260); c.parent(hostRef.current); p.noStroke(); p.frameRate(30); };
          p.windowResized = () => p.resizeCanvas(p.windowWidth, 260);
          p.draw = () => {
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
            p.clear();
            if (Math.random() < 0.35 && sparks.length < 120) { sparks.push({ x: Math.random()*p.width, y: p.height+10, a: 240, r: 1+Math.random()*3 }); }
            for (let i = sparks.length - 1; i >= 0; i--) {
              const s = sparks[i]; s.y -= 0.6 + Math.random()*1.2; s.x += Math.sin(p.frameCount/22 + i)*0.2; s.a -= 3 + Math.random()*2;
              p.fill(255, 140, 0, s.a); p.ellipse(s.x, s.y, s.r*2);
              if (s.a <= 0 || s.y < -10) sparks.splice(i,1);
            }
          };
        });
        cleanup = () => inst?.remove?.();
      })
      .catch(() => {});
    return () => { mounted = false; cleanup(); };
  }, [active]);
  return <div ref={hostRef} className="absolute inset-x-0 top-0 -z-10 opacity-80" aria-hidden />;
}

/************************************
 * Icons & Marks (inline SVG)
 ************************************/
const Icon = ({ d, className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);
const Icons = {
  Plus: (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
  Trash: (p) => <Icon {...p} d="M3 6h18M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />,
  Wallet: (p) => <Icon {...p} d="M3 7h18v10H3zM21 9h-6a2 2 0 0 0 0 6h6" />,
  Calendar: (p) => <Icon {...p} d="M3 4h18v18H3zM3 8h18M8 2v4M16 2v4" />,
  Download: (p) => <Icon {...p} d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />,
  Upload: (p) => <Icon {...p} d="M12 21V9m0 0l-4 4m4-4l4 4M5 3h14" />,
};

function PhoenixMark({ className = "w-12 h-12" }) {
  return (
    <svg viewBox="0 0 256 256" className={className} role="img" aria-label="Phoenix logo">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ff7a18" />
          <stop offset="50%" stopColor="#ff3d00" />
          <stop offset="100%" stopColor="#8b2c0f" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g fill="url(#g)" filter="url(#glow)">
        <path d="M128 24c14 18 24 35 24 52 0 12-5 22-12 30 26-8 50-28 60-60 6 40-10 68-38 84 26-4 48-16 64-40-6 40-34 70-74 82 12 4 22 4 32 2-24 16-52 18-84 10-32 8-60 6-84-10 10 2 20 2 32-2C34 138 6 108 0 68c16 24 38 36 64 40C36 92 20 64 26 24c10 32 34 52 60 60-7-8-12-18-12-30 0-17 10-34 24-52z" />
      </g>
    </svg>
  );
}

/************************************
 * Plan Engine
 ************************************/
const MODES = {
  EVEN_30: { key: 'EVEN_30', label: 'Even Daily (30-day standard)' },
  EVEN_ACTUAL: { key: 'EVEN_ACTUAL', label: 'Even Daily (actual month)' },
  DUE_DATE: { key: 'DUE_DATE', label: 'By Due Date (sinking)' },
};

function computePlan(expenses, mode, today = new Date()) {
  const dim = daysInMonth(today);
  const todayDate = today.getDate();
  return expenses.map((e) => {
    const amount = Math.max(0, Number(e.amount) || 0);
    let daily = 0;
    if (mode === MODES.EVEN_30.key) daily = amount / 30;
    else if (mode === MODES.EVEN_ACTUAL.key) daily = amount / dim;
    else {
      const due = clamp(Number(e.dueDay) || dim, 1, 31);
      const remainingDays = due >= todayDate ? (due - todayDate + 1) : (dim - todayDate + due + 1);
      daily = amount / remainingDays;
    }
    return { ...e, perDay: daily, perWeek: daily * 7, perBiWeekly: daily * 14 };
  });
}

function totalFor(plan, field = 'perDay') { return plan.reduce((s, e) => s + (e[field] || 0), 0); }

/************************************
 * IDs (no crypto)
 ************************************/
let __id = 0; const uid = () => { __id = (__id + 1) >>> 0; return `${Date.now().toString(36)}${Math.random().toString(36).slice(2,9)}${__id.toString(36)}`; };

/************************************
 * Seed
 ************************************/
const DEFAULT_SEED = [
  { name: 'Rent', amount: 1200, dueDay: 1, category: 'Housing', color: '#ff7a18', autopay: true },
  { name: 'Car Payment', amount: 250, dueDay: 20, category: 'Transport', color: '#ff3d00', autopay: true },
  { name: 'Insurance', amount: 90, dueDay: 15, category: 'Auto', color: '#f97316', autopay: false },
  { name: 'Internet', amount: 65, dueDay: 10, category: 'Utilities', color: '#f59e0b', autopay: true },
];
const seedWithIds = () => DEFAULT_SEED.map((e) => ({ ...e, id: uid() }));

/************************************
 * UI Primitives
 ************************************/
function Card({ className = '', children }) { return <div className={`rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur shadow-xl ${className}`}>{children}</div>; }
function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
function CardBody({ className = '', children }) { return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>; }
function Button({ children, onClick, variant = 'primary', className = '', type = 'button' }) {
  const base = variant === 'ghost' ? 'bg-transparent hover:bg-white/5' : variant === 'danger' ? 'bg-rose-600 hover:bg-rose-500' : variant === 'secondary' ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-amber-600 hover:bg-amber-500';
  return <button type={type} onClick={onClick} className={`px-3 sm:px-4 py-2 rounded-xl text-white font-medium shadow ${base} ${className}`}>{children}</button>;
}
function Input({ className = '', ...props }) { return <input {...props} className={`w-full px-3 py-2 rounded-xl bg-zinc-800/70 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${className}`} />; }
function Select({ className = '', children, ...props }) { return <select {...props} className={`w-full px-3 py-2 rounded-xl bg-zinc-800/70 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${className}`}>{children}</select>; }

/************************************
 * SVG Exporter
 ************************************/
const escapeXml = (s) => String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
function downloadSVG(plan, modeLabel) {
  const pad = 24, rowH = 32, width = 920, height = pad * 3 + rowH * (plan.length + 4);
  const today = new Date().toLocaleDateString();
  const rows = plan.map((e,i) => {
    const y = pad*2 + 60 + i*rowH;
    return `<g transform='translate(${pad}, ${y})'>
      <rect x='0' y='-22' width='${width-pad*2}' height='28' fill='rgba(255,255,255,0.02)'/>
      <text x='0' y='0' fill='#fff' font-size='14' font-family='Inter, system-ui' >${escapeXml(e.name)}</text>
      <text x='400' y='0' fill='#ffd166' text-anchor='end' font-size='14'>${currency.format(e.amount)}</text>
      <text x='560' y='0' fill='#ffd166' text-anchor='end' font-size='14'>${e.dueDay || '—'}</text>
      <text x='740' y='0' fill='#00d1b2' text-anchor='end' font-size='14'>${currency.format(e.perDay)}</text>
    </g>`;
  }).join("\n");
  const svg = `<?xml version='1.0' encoding='UTF-8'?>
  <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>
    <defs>
      <linearGradient id='g' x1='0' x2='0' y1='0' y2='1'><stop offset='0%' stop-color='#ff7a18'/><stop offset='50%' stop-color='#ff3d00'/><stop offset='100%' stop-color='#8b2c0f'/></linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='#0a0a0a'/>
    <g transform='translate(${pad}, ${pad})'>
      <circle cx='28' cy='28' r='28' fill='url(#g)'/>
      <text x='64' y='12' fill='#fff' font-size='20' font-weight='700' font-family='Inter, system-ui'>The Phoenix Plan</text>
      <text x='64' y='34' fill='#aaa' font-size='12' font-family='Inter, system-ui'>Daily Pay Blueprint · ${escapeXml(modeLabel)} · ${today}</text>
    </g>
    <g transform='translate(${pad}, ${pad+56})'>
      <text x='0' y='0' fill='#aaa' font-size='13'>Expense</text>
      <text x='400' y='0' fill='#aaa' text-anchor='end' font-size='13'>Monthly</text>
      <text x='560' y='0' fill='#aaa' text-anchor='end' font-size='13'>Due</text>
      <text x='740' y='0' fill='#aaa' text-anchor='end' font-size='13'>Daily</text>
    </g>
    ${rows}
    <g transform='translate(${pad}, ${height-pad-24})'>
      <rect x='0' y='-20' width='${width-pad*2}' height='28' fill='rgba(255,255,255,0.04)'/>
      <text x='0' y='0' fill='#fff' font-size='14' font-weight='700'>Today's set-aside total</text>
      <text x='740' y='0' fill='#00d1b2' text-anchor='end' font-size='16' font-weight='700'>${currency.format(totalFor(plan,'perDay'))}</text>
    </g>
  </svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `phoenix-plan-${Date.now()}.svg`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

/************************************
 * Mini SVG Charts (pure React)
 ************************************/
function AreaChartMini({ data, width = 600, height = 180, stroke = '#fb923c', fill = '#fb923c55' }) {
  if (!data.length) return null; const w = width, h = height, pad = 24;
  const x = (i) => pad + (i * (w - pad*2)) / (data.length - 1);
  const [min, max] = data.reduce((acc,d)=>[Math.min(acc[0], d.balance), Math.max(acc[1], d.balance)], [Infinity,-Infinity]);
  const y = (v) => pad + (h - pad*2) * (1 - (v - min) / (max - min || 1));
  const path = data.map((d,i)=>`${i?'L':'M'}${x(i)},${y(d.balance)}`).join(' ');
  const area = `${path} L ${pad + (w - pad*2)},${h - pad} L ${pad},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <g fill="none" stroke="white" opacity="0.15"><line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad}/><line x1={pad} y1={pad} x2={pad} y2={h-pad}/></g>
      <path d={area} fill={fill} />
      <path d={path} stroke={stroke} fill="none" />
    </svg>
  );
}

/************************************
 * Guides (condensed from uploaded curriculum)
 ************************************/
const GUIDES = [
  { id: 'part1', title: 'Part I: Financial Triage', sections: [
    { id: 'sec1-1', title: 'The Garnishment Gauntlet', takeaway: 'Treat garnishment as a fixed, predictable line item.', content: 'What it is, disposable earnings, CCPA limits, priority of child support, and practical framing to regain control.' },
    { id: 'sec1-2', title: 'The Turnaround Budget', takeaway: 'Zero-Based Budget + conservative income baseline.', content: 'Five-step ZBB with surplus strategy for irregular income.' },
    { id: 'sec1-3', title: 'Cash Flow Command', takeaway: 'Align due dates just after paydays.', content: 'Emergency bare-bones plan; proactive due-date moves to smooth timing.' },
    { id: 'sec1-4', title: 'Emergency Fund Imperative', takeaway: 'Hit $1,000 starter fund first.', content: 'Automate transfers; dedicate windfalls; seed via selling unused stuff.' },
  ]},
  { id: 'part2', title: 'Part II: Credit Score Comeback', sections: [
    { id: 'sec2-1', title: 'Deconstructing Your Credit', takeaway: 'Understand 5 FICO factors.', content: 'Payment history, utilization, age, mix, new credit.' },
    { id: 'sec2-2', title: 'Rebuilding Toolkit', takeaway: 'Start with credit‑builder loan, then secured card.', content: 'Add installment trade line first; then a low-fee secured card.' },
    { id: 'sec2-3', title: 'Credit Piggybacking', takeaway: 'Authorized user only with trusted person.', content: 'Never buy tradelines; benefit from age/limit/on-time history.' },
    { id: 'sec2-4', title: 'Clean Slate Initiative', takeaway: 'Dispute errors; goodwill letters for isolated mistakes.', content: 'Write formally to bureaus/creditors; document everything.' },
  ]},
  { id: 'part3', title: 'Part III: From Stability to Growth', sections: [
    { id: 'sec3-1', title: 'Debt Demolition Derby', takeaway: 'Snowball for momentum → Avalanche for math.', content: 'Hybrid “Snow‑lanche” works well in practice.' },
    { id: 'sec3-2', title: 'Power of Compounding', takeaway: 'Turn compounding from enemy to ally.', content: 'Pay down high APR then invest for the long run.' },
    { id: 'sec3-3', title: 'First Investments', takeaway: 'One low-cost total market ETF is enough to start.', content: 'Prereqs, horizon, open brokerage, automate contributions.' },
    { id: 'sec3-4', title: 'Tax-Advantaged Planning', takeaway: '401(k) match → Roth IRA → back to 401(k).', content: 'Shelter growth; keep fees low; keep it simple.' },
  ]},
];

/************************************
 * Expense Row
 ************************************/
function ExpenseRow({ exp, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center py-2">
      <div className="col-span-5 sm:col-span-3"><Input value={exp.name} onChange={(e)=>onChange({ ...exp, name: e.target.value })} placeholder="Name (e.g., Car)" /></div>
      <div className="col-span-3 sm:col-span-2"><Input type="number" min={0} step="0.01" value={exp.amount} onChange={(e)=>onChange({ ...exp, amount: parseMoney(e.target.value) })} placeholder="Amount" /></div>
      <div className="col-span-2 sm:col-span-1"><Input type="number" min={1} max={31} value={exp.dueDay} onChange={(e)=>onChange({ ...exp, dueDay: clamp(Number(e.target.value||1),1,31) })} placeholder="Due" /></div>
      <div className="hidden sm:block sm:col-span-2"><Input value={exp.category} onChange={(e)=>onChange({ ...exp, category: e.target.value })} placeholder="Category" /></div>
      <div className="hidden sm:block sm:col-span-2"><Input type="color" value={exp.color} onChange={(e)=>onChange({ ...exp, color: e.target.value })} /></div>
      <div className="col-span-2 text-right"><Button variant="danger" onClick={()=>onRemove(exp.id)} className="w-full sm:w-auto">Remove</Button></div>
    </div>
  );
}

/************************************
 * Dashboard widgets (windfalls & one-time expenses)
 ************************************/
function MyCard({ balance = 0 }) {
  return (
    <div className="p-5 rounded-xl border border-white/10 bg-black/60 shadow relative overflow-hidden h-44 flex flex-col justify-between">
      <PhoenixMark className="w-32 h-32 opacity-10 absolute right-2 -top-4" />
      <div className="relative"><p className="text-sm opacity-80">Balance</p><p className="text-2xl font-bold">{currency.format(balance)}</p></div>
      <div className="flex items-center justify-between relative">
        <p className="font-mono tracking-wider">**** **** **** 1234</p>
        <span className="text-xs opacity-70">Phoenix</span>
      </div>
    </div>
  );
}

function AddFunds({ onAdd }) {
  const onSubmit = (e) => { e.preventDefault(); const f = e.currentTarget; const amount = parseMoney(f.amount.value); const name = f.source.value.trim(); if (name && amount>0) { onAdd({ id: uid(), type: 'Income', name, amount, date: new Date().toISOString() }); f.reset(); }};
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Input name="source" placeholder="Source (e.g., Side Job)" required />
      <div className="flex gap-2"><Input name="amount" type="number" step="0.01" placeholder="Amount" required /><Button type="submit" className="whitespace-nowrap">Add income</Button></div>
    </form>
  );
}

function AddOneTimeExpense({ onAdd }) {
  const onSubmit = (e) => { e.preventDefault(); const f = e.currentTarget; const amount = parseMoney(f.amount.value); const name = f.name.value.trim(); if (name && amount>0) { onAdd({ id: uid(), type: 'Expense', name, amount, date: new Date().toISOString() }); f.reset(); }};
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Input name="name" placeholder="Expense name (e.g., Coffee)" required />
      <div className="flex gap-2"><Input name="amount" type="number" step="0.01" placeholder="Amount" required /><Button type="submit" variant="danger" className="whitespace-nowrap">Log expense</Button></div>
    </form>
  );
}

/************************************
 * Import / Export JSON
 ************************************/
function ExportButton({ state }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20" onClick={() => {
      const data = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state, null, 2))}`;
      const a = document.createElement('a'); a.href = data; a.download = `phoenix-plan-${new Date().toISOString().slice(0,10)}.json`; a.click();
    }} title="Export your plan as JSON">
      <Icons.Download /> Export
    </button>
  );
}
function ImportButton({ onLoad }) {
  const ref = useRef(null);
  return (
    <>
      <input ref={ref} type="file" accept="application/json" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => { try { onLoad(JSON.parse(String(r.result))); } catch { alert('Invalid JSON'); } }; r.readAsText(file);
      }} />
      <button className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20" onClick={() => ref.current?.click()} title="Import a saved plan"><Icons.Upload /> Import</button>
    </>
  );
}

/************************************
 * App State Normalization + Reducer
 ************************************/
const initialState = {
  expenses: seedWithIds(),
  settings: { monthlyIncome: 3500, cycleMode: 'actual', allocationMode: 'even', roundTo: 'cent' },
  transactions: [], // { id, type: 'Income'|'Expense', name, amount, date: ISO }
};

function normalizeState(s) {
  const src = (s && typeof s === 'object') ? s : {};
  const expenses = Array.isArray(src.expenses) ? src.expenses : [];
  const withIds = expenses.map((e) => ({ ...e, id: e?.id || uid() }));
  const defaults = initialState.settings;
  const settings = { ...defaults, ...(src.settings || {}) };
  const transactions = Array.isArray(src.transactions) ? src.transactions : [];
  return { expenses: withIds, settings, transactions };
}

function reducer(state, action) {
  switch (action.type) {
    case 'add-expense':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'update-expense':
      return { ...state, expenses: state.expenses.map(e => e.id === action.id ? { ...e, ...action.patch } : e) };
    case 'remove-expense':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.id) };
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'add-tx': {
      const txs = Array.isArray(state.transactions) ? state.transactions : [];
      return { ...state, transactions: [action.payload, ...txs].slice(0, 300) };
    }
    case 'replace':
      return normalizeState(action.payload);
    default:
      return state;
  }
}

/************************************
 * Derived Plan + Projection
 ************************************/
function usePlan(expenses, settings) {
  const today = new Date();
  const cycleDays = settings.cycleMode === 'actual' ? daysInMonth(today) : 30;
  const perExpense = expenses.map((e) => {
    const evenDaily = e.amount / cycleDays;
    const due = clamp(Number(e.dueDay)||cycleDays, 1, 31);
    const todayDate = today.getDate();
    const remain = due >= todayDate ? (due - todayDate + 1) : (cycleDays - todayDate + due + 1);
    const untilDueDaily = e.amount / remain;
    const daily = settings.allocationMode === 'even' ? evenDaily : untilDueDaily;
    return { ...e, evenDaily, untilDueDaily, daily };
  });
  const totals = perExpense.reduce((acc, e) => ({ monthly: acc.monthly + e.amount, daily: acc.daily + e.daily }), { monthly: 0, daily: 0 });
  const dailyIncome = settings.monthlyIncome / cycleDays;
  const payToday = perExpense.map((e) => ({ id: e.id, name: e.name, amount: e.daily }));
  return { today, cycleDays, perExpense, totals, dailyIncome, payToday };
}

function useHistory(plan, settings, transactions, days = 30) {
  // Ensure transactions is iterable
  const txList = Array.isArray(transactions) ? transactions : [];
  const cycleDays = plan.cycleDays;
  const dailyIncome = settings.monthlyIncome / cycleDays;
  const dailyOutflow = plan.totals.daily;
  const now = new Date();
  const start = new Date(now); start.setDate(now.getDate() - days);
  const txByDay = {};
  for (const t of txList) {
    const d = new Date(t.date); const key = d.toISOString().slice(0,10);
    (txByDay[key] ||= []).push(t);
  }
  const data = [];
  let balance = 0;
  for (let i = 0; i <= days; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0,10);
    balance += dailyIncome; // base inflow
    balance -= dailyOutflow; // base outflow
    if (txByDay[key]) {
      for (const t of txByDay[key]) balance += t.type === 'Income' ? t.amount : -t.amount;
    }
    data.push({ day: key, balance });
  }
  return data;
}

/************************************
 * Tabs
 ************************************/
function Tabs({ value, onChange, items }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {items.map((it) => (
        <button key={it.value} onClick={() => onChange(it.value)} className={`px-3 py-1.5 rounded-2xl text-sm ${value===it.value? 'bg-orange-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}>{it.label}</button>
      ))}
    </div>
  );
}

/************************************
 * Main App
 ************************************/
export default function PhoenixPlanApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Persist
  useEffect(() => { try { const saved = localStorage.getItem('phoenix-plan'); if (saved) dispatch({ type: 'replace', payload: JSON.parse(saved) }); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem('phoenix-plan', JSON.stringify(state)); } catch {} }, [state]);

  // Always work with a safe transactions array in the view layer
  const tx = Array.isArray(state.transactions) ? state.transactions : [];

  const plan = usePlan(state.expenses, state.settings);
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [tab, setTab] = useState('plan');
  const [filterDays, setFilterDays] = useState(30);
  const history = useHistory(plan, state.settings, tx, filterDays);

  const rounded = (n) => state.settings.roundTo === 'dollar' ? Math.ceil(n) : Math.round(n*100)/100;

  const addExpense = () => dispatch({ type: 'add-expense', payload: { id: uid(), name: 'New Expense', amount: 0, dueDay: 1, category: 'Other', color: '#ff7a18', autopay: false } });

  const cadenceValue = (cadence) => cadence === 'weekly' ? totalFor(computePlan(state.expenses, state.settings.cycleMode==='actual'?MODES.EVEN_ACTUAL.key:MODES.EVEN_30.key), 'perDay')*7 : cadence === 'biweekly' ? totalFor(computePlan(state.expenses, state.settings.cycleMode==='actual'?MODES.EVEN_ACTUAL.key:MODES.EVEN_30.key), 'perDay')*14 : plan.totals.daily;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Background */}
      <div className="relative h-56 overflow-hidden"><EmbersBG active={!prefersReduced} /></div>

      {/* Header */}
      <header className="relative -mt-32 mx-auto max-w-6xl px-4 sm:px-6">
        <Card>
          <CardHeader
            title={<div className="flex items-center gap-3">
              <PhoenixMark />
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">The Phoenix Plan</div>
                <div className="text-zinc-400 text-sm">Turn big monthly bills into tiny daily moves</div>
              </div>
            </div>}
            action={<div className="flex items-center gap-2">
              <ExportButton state={state} />
              <ImportButton onLoad={(data)=>dispatch({ type: 'replace', payload: data })} />
            </div>}
          />
          <CardBody>
            {/* Tabs */}
            <div className="flex items-center justify-between mb-4">
              <Tabs value={tab} onChange={setTab} items={[{ value:'plan', label:'Plan' }, { value:'dashboard', label:'Dashboard' }, { value:'guides', label:'Guides' }]} />
              <div className="flex items-center gap-2">
                <label className="text-sm opacity-80">Chart:
                  <select className="ml-2 rounded-xl bg-white/10 px-2 py-1" value={filterDays} onChange={(e)=>setFilterDays(Number(e.target.value))}>
                    <option value={7}>7D</option>
                    <option value={30}>30D</option>
                    <option value={90}>90D</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Panels */}
            {tab === 'plan' && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Editor */}
                <div className="md:col-span-2">
                  <Card className="mb-6">
                    <CardHeader title="Your expenses" subtitle="Add your monthly bills and due dates. We'll compute what to set aside per day so nothing sneaks up on you." action={<Button onClick={addExpense}><Icons.Plus className="mr-1" /> Add</Button>} />
                    <CardBody>
                      <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-zinc-400 pb-2 border-b border-white/10">
                        <div className="col-span-5 sm:col-span-3">Name</div>
                        <div className="col-span-3 sm:col-span-2">Monthly</div>
                        <div className="col-span-2 sm:col-span-1">Due</div>
                        <div className="hidden sm:block sm:col-span-2">Category</div>
                        <div className="hidden sm:block sm:col-span-2">Color</div>
                        <div className="col-span-2 text-right">Action</div>
                      </div>
                      <div>
                        {state.expenses.map((e) => (
                          <ExpenseRow key={e.id} exp={e} onChange={(next)=>dispatch({ type:'update-expense', id:e.id, patch: next })} onRemove={(id)=>dispatch({ type:'remove-expense', id })} />
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader title="Understanding the plan" />
                    <CardBody>
                      <p className="text-zinc-300 leading-relaxed">
                        <strong>Even Daily</strong> spreads each bill across the whole month so you stash the same small amount every day.
                        <strong> By Due Date</strong> targets each due date—if a bill is closer, the app nudges a little more today so you're fully funded by that date.
                        Switch the cadence to see the exact amount to move daily, weekly, or every other week.
                      </p>
                    </CardBody>
                  </Card>
                </div>

                {/* Today */}
                <div className="md:col-span-1">
                  <Card className="sticky top-6">
                    <CardHeader title={"Today's set‑aside"} subtitle={new Date().toLocaleDateString()} action={<Button variant="secondary" onClick={()=>downloadSVG(computePlan(state.expenses, MODES.EVEN_ACTUAL.key), 'Even Daily (actual month)')}>Export SVG</Button>} />
                    <CardBody>
                      <div className="text-4xl font-extrabold text-emerald-400 mb-4">{currency.format(plan.totals.daily)}</div>
                      <div className="space-y-2">
                        {plan.perExpense.map((e) => (
                          <div key={e.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
                              <span className="text-sm text-zinc-300">{e.name}</span>
                            </div>
                            <div className="text-sm text-zinc-400 tabular-nums">{currency.format(e.daily)}</div>
                          </div>
                        ))}
                      </div>
                      <hr className="my-4 border-white/10" />
                      <div className="text-sm text-zinc-400">Monthly total: <span className="text-white font-semibold">{currency.format(plan.perExpense.reduce((s, e)=>s+e.amount, 0))}</span></div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            {tab === 'dashboard' && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader title="Balance projection" subtitle={`Includes windfalls & one-time expenses over last ${filterDays} days`} />
                    <CardBody>
                      <div className="h-48"><AreaChartMini data={history} /></div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader title="Activity" />
                    <CardBody>
                      <div className="space-y-2">
                        {tx.length === 0 && <div className="text-sm text-zinc-400">No activity yet. Add income or log a one-time expense →</div>}
                        {tx.slice(0, 8).map((t) => (
                          <div key={t.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                            <div className="flex items-center gap-3">
                              <span className={`inline-block w-2.5 h-2.5 rounded-full ${t.type==='Income'?'bg-emerald-400':'bg-rose-400'}`} />
                              <div className="text-sm"><span className="font-medium">{t.name}</span> <span className="opacity-60">· {new Date(t.date).toLocaleDateString()}</span></div>
                            </div>
                            <div className={`tabular-nums ${t.type==='Income'?'text-emerald-400':'text-rose-400'}`}>{t.type==='Income'?'+':'-'}{currency.format(t.amount)}</div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>

                <div className="md:col-span-1 space-y-6">
                  <Card>
                    <CardHeader title="My card" />
                    <CardBody><MyCard balance={history.at(-1)?.balance || 0} /></CardBody>
                  </Card>
                  <Card>
                    <CardHeader title="Add windfall / extra income" />
                    <CardBody><AddFunds onAdd={(tx)=>dispatch({ type:'add-tx', payload: tx })} /></CardBody>
                  </Card>
                  <Card>
                    <CardHeader title="Log one-time expense" />
                    <CardBody><AddOneTimeExpense onAdd={(tx)=>dispatch({ type:'add-tx', payload: tx })} /></CardBody>
                  </Card>
                </div>
              </div>
            )}

            {tab === 'guides' && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  {GUIDES.map((part) => (
                    <Card key={part.id}>
                      <CardHeader title={part.title} />
                      <CardBody>
                        <div className="space-y-3">
                          {part.sections.map((s) => (
                            <details key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                              <summary className="cursor-pointer font-semibold">{s.title} <span className="ml-2 text-xs font-normal opacity-70">{s.takeaway}</span></summary>
                              <p className="mt-2 text-zinc-300 text-sm leading-relaxed">{s.content}</p>
                            </details>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                <div className="md:col-span-1 space-y-4">
                  <Card>
                    <CardHeader title="Settings" />
                    <CardBody>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <label className="block text-sm"><span className="mb-1 inline-flex items-center gap-2 font-medium"><Icons.Wallet /> Income (take‑home)</span><input className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2" type="number" step="0.01" value={state.settings.monthlyIncome} onChange={(e)=>dispatch({ type:'settings', patch:{ monthlyIncome: fmtNumber(parseMoney(e.target.value)) } })} /></label>
                        <label className="block text-sm"><span className="mb-1 inline-flex items-center gap-2 font-medium">Cycle</span><select className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2" value={state.settings.cycleMode} onChange={(e)=>dispatch({ type:'settings', patch:{ cycleMode: e.target.value } })}><option value="actual">Actual month</option><option value="thirty">Fixed 30</option></select></label>
                        <label className="block text-sm"><span className="mb-1 inline-flex items-center gap-2 font-medium">Allocation</span><select className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2" value={state.settings.allocationMode} onChange={(e)=>dispatch({ type:'settings', patch:{ allocationMode: e.target.value } })}><option value="even">Even</option><option value="untilDue">Until due</option></select></label>
                        <label className="block text-sm"><span className="mb-1 inline-flex items-center gap-2 font-medium">Rounding</span><select className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2" value={state.settings.roundTo} onChange={(e)=>dispatch({ type:'settings', patch:{ roundTo: e.target.value } })}><option value="cent">Nearest cent</option><option value="dollar">Round up</option></select></label>
                      </div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardHeader title="Quick actions" />
                    <CardBody className="flex flex-wrap gap-2"><Button onClick={()=>downloadSVG(computePlan(state.expenses, MODES.EVEN_ACTUAL.key), 'Even Daily (actual month)')}>Export SVG</Button><Button variant="secondary" onClick={()=>{ if (typeof window !== 'undefined' && window.confirm && window.confirm('Reset to demo data?')) dispatch({ type:'replace', payload: { expenses: seedWithIds(), settings: initialState.settings, transactions: [] } }); }}>Reset</Button></CardBody>
                  </Card>
                </div>
              </div>
            )}

          </CardBody>
        </Card>
      </header>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-12 text-center text-zinc-500"><p className="text-xs">Made for real-life budgeting: zero-based planning, sinking funds, and daily micro-moves. Save the SVG and share your plan.</p></footer>
    </div>
  );
}

/************************************
 * Smoke Tests (console only)
 ************************************/
function assertAlmostEq(actual, expected, eps = 1e-6, label = '') { if (Math.abs(actual - expected) > eps) { console.error(`❌ ${label} expected ~${expected}, got ${actual}`); } else { console.log(`✅ ${label}`); } }
function runSmokeTests() {
  try {
    const plan1 = computePlan([{ id:'x', name:'Car', amount:250, dueDay:20 }], MODES.EVEN_30.key, new Date(2025,0,1));
    assertAlmostEq(plan1[0].perDay, 250/30, 1e-9, 'EVEN_30 perDay = 250/30');

    const plan2 = computePlan([{ id:'x', name:'Any', amount:280, dueDay:10 }], MODES.EVEN_ACTUAL.key, new Date(2025,1,1));
    assertAlmostEq(plan2[0].perDay, 280/28, 1e-9, 'EVEN_ACTUAL Feb 28 days');

    const plan3 = computePlan([{ id:'x', name:'Bill', amount:220, dueDay:20 }], MODES.DUE_DATE.key, new Date(2025,0,10));
    assertAlmostEq(plan3[0].perDay, 220/11, 1e-9, 'DUE_DATE forward window');

    const plan4 = computePlan([{ id:'x', name:'Bill', amount:180, dueDay:2 }], MODES.DUE_DATE.key, new Date(2025,0,28));
    assertAlmostEq(plan4[0].perDay, 180/6, 1e-9, 'DUE_DATE wrap-around');

    // Uniqueness of uid
    const s = new Set(Array.from({ length: 200 }, () => uid()));
    if (s.size !== 200) console.error('❌ ID collisions'); else console.log('✅ ID uniqueness (200)');

    // New: normalization keeps transactions iterable
    const replaced = reducer(initialState, { type: 'replace', payload: { expenses: [{ name:'X', amount: 10, dueDay: 1 }] } });
    if (!Array.isArray(replaced.transactions)) console.error('❌ normalizeState did not ensure transactions array'); else console.log('✅ normalizeState transactions array');

    // New: useHistory tolerates undefined/null transactions
    const planTest = usePlan([{ id:'1', name:'A', amount: 30, dueDay: 10 }], { monthlyIncome: 3000, cycleMode:'thirty', allocationMode:'even', roundTo:'cent' });
    const hist1 = useHistory(planTest, { monthlyIncome: 3000 }, undefined, 7);
    const hist2 = useHistory(planTest, { monthlyIncome: 3000 }, null, 7);
    if (!Array.isArray(hist1) || !Array.isArray(hist2)) console.error('❌ useHistory did not return arrays'); else console.log('✅ useHistory safe with missing transactions');
  } catch (err) { console.error('Smoke tests errored:', err); }
}
const __DEV__ = (() => { try { return !!(typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window?.location?.hostname)); } catch { return false; } })();
if (__DEV__) { console.log('Running Phoenix Plan smoke tests...'); runSmokeTests(); }
