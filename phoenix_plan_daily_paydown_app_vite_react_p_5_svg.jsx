import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";

// Phoenix Plan — Unified App (React + SVG + p5 CDN + Chart.js CDN)
// Combines: daily expense chip-away planner + balance chart + rich guides library.
// No import.meta usage; runs in Canvas, Vite, older bundlers. Chart.js & p5 via CDN.

// ----------------------------- Utility & Icons ------------------------------
const Icon = ({ path, className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={path} />
  </svg>
);
const Icons = {
  Dollar: (p) => <Icon {...p} path="M12 1v22M17 5a4 4 0 0 0-4-2H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H7" />,
  Plus: (p) => <Icon {...p} path="M12 5v14M5 12h14" />,
  Trash: (p) => <Icon {...p} path="M3 6h18M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />,
  Calendar: (p) => <Icon {...p} path="M3 4h18v18H3zM3 8h18M8 2v4M16 2v4" />,
  Book: (p) => <Icon {...p} path="M3 4h13a5 5 0 0 1 5 5v11H6a3 3 0 0 0-3 3z" />,
  Trend: (p) => <Icon {...p} path="M3 17l6-6 4 4 7-7" />,
  Wallet: (p) => <Icon {...p} path="M3 7h18v10H3zM21 9h-6a2 2 0 0 0 0 6h6" />,
  Sparkles: (p) => <Icon {...p} path="M12 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2zM19 13l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />,
  Download: (p) => <Icon {...p} path="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />,
  Upload: (p) => <Icon {...p} path="M12 21V9m0 0l-4 4m4-4l4 4M5 3h14" />,
};
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (n) => (isFinite(n) ? n : 0);
const asCurrency = (n) => Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getCycleDays({ cycleMode }, d) { const y = d.getFullYear(), m = d.getMonth(); return cycleMode === "actual" ? daysInMonth(y, m) : 30; }
function daysUntilDue(dueDay, today) {
  const y = today.getFullYear(), m = today.getMonth();
  const dueThis = new Date(y, m, clamp(dueDay, 1, daysInMonth(y, m)));
  if (dueThis >= new Date(y, m, today.getDate())) return Math.max(1, Math.ceil((dueThis - today) / 86400000));
  const next = new Date(y, m + 1, clamp(dueDay, 1, daysInMonth(y, m + 1)));
  return Math.max(1, Math.ceil((next - today) / 86400000));
}
function safeParseCurrency(str) { const n = Number(String(str).replace(/[^0-9.\-]/g, "")); return isFinite(n) ? n : 0; }

// ----------------------------- SVG Phoenix ----------------------------------
const PhoenixLogo = ({ className = "w-14 h-14" }) => (
  <svg className={className} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff8a00" /><stop offset="50%" stopColor="#ff3d00" /><stop offset="100%" stopColor="#ff006e" /></linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    <g fill="url(#g)" filter="url(#glow)"><path d="M60 14c9 9 11 20 5 33 5-6 10-9 17-13 8-4 15-8 20-16 1 10-3 19-11 27 8-2 14-7 18-15-1 12-7 22-18 30-5 4-10 7-15 9 4 6 6 12 5 19-4-8-10-13-20-18-10 5-16 10-20 18-1-7 1-13 5-19-5-2-10-5-15-9-11-8-17-18-18-30 4 8 10 13 18 15-8-8-12-17-11-27 5 8 12 12 20 16 7 4 12 7 17 13-6-13-4-24 5-33z" /><path d="M60 78c-7 10-7 18-1 28 7-10 7-18 1-28z" /></g>
  </svg>
);

// ----------------------------- p5 Embers (CDN) ------------------------------
function loadP5FromCDN() {
  if (typeof window === "undefined") return Promise.reject(new Error("no-window"));
  if (window.p5) return Promise.resolve(window.p5);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/p5@1.11.1/lib/p5.min.js"; s.async = true;
    s.onload = () => (window.p5 ? resolve(window.p5) : reject(new Error("p5-not-global"))); s.onerror = () => reject(new Error("p5-cdn-failed"));
    document.head.appendChild(s);
  });
}
function Embers({ active }) {
  const hostRef = useRef(null);
  useEffect(() => {
    let cleanup = () => {}; if (!active) return cleanup; let mounted = true;
    loadP5FromCDN().then((P5) => { if (!mounted || !P5) return; const inst = new P5((p) => {
      const sparks = []; p.setup = () => { const c = p.createCanvas(p.windowWidth, p.windowHeight); c.parent(hostRef.current); p.noStroke(); p.frameRate(30); };
      p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
      p.draw = () => { if (typeof document !== "undefined" && document.visibilityState !== "visible") return; p.clear();
        if (Math.random() < 0.3 && sparks.length < 120) sparks.push({ x: Math.random() * p.width, y: p.height + 10, a: 255, r: 1 + Math.random() * 3 });
        for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.y -= 0.5 + Math.random() * 1.5; s.x += Math.sin(p.frameCount / 20 + i) * 0.2; s.a -= 2 + Math.random() * 3; p.fill(255, 120 + (i % 80), 0, s.a); p.ellipse(s.x, s.y, s.r * 2); if (s.a <= 0 || s.y < -10) sparks.splice(i, 1); }
      }; }); cleanup = () => inst?.remove?.(); }).catch(() => {});
    return () => { mounted = false; cleanup?.(); };
  }, [active]);
  return <div ref={hostRef} className="pointer-events-none fixed inset-0 -z-10" aria-hidden />;
}

// ----------------------------- Chart.js (CDN) -------------------------------
function loadChartFromCDN() {
  if (typeof window === "undefined") return Promise.reject(new Error("no-window"));
  if (window.Chart) return Promise.resolve(window.Chart);
  return new Promise((resolve, reject) => {
    const a = document.createElement("script"); a.src = "https://cdn.jsdelivr.net/npm/chart.js"; a.async = true;
    a.onload = () => { const b = document.createElement("script"); b.src = "https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3"; b.async = true; b.onload = () => resolve(window.Chart); b.onerror = () => resolve(window.Chart || null); document.head.appendChild(b); };
    a.onerror = () => reject(new Error("chartjs-cdn-failed")); document.head.appendChild(a);
  });
}

// ----------------------------- State ----------------------------------------
const initialState = {
  expenses: [
    { id: uid(), name: "Car Payment", amount: 250, dueDay: 15, category: "Transport" },
    { id: uid(), name: "Rent", amount: 1200, dueDay: 1, category: "Housing" },
    { id: uid(), name: "Internet", amount: 60, dueDay: 10, category: "Utilities" },
  ],
  settings: { monthlyIncome: 3500, cycleMode: "actual", allocationMode: "even", roundTo: "cent", showWeekends: true },
};
function reducer(state, action) {
  switch (action.type) {
    case "add": return { ...state, expenses: [...state.expenses, action.payload] };
    case "remove": return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) };
    case "update": return { ...state, expenses: state.expenses.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)) };
    case "settings": return { ...state, settings: { ...state.settings, ...action.patch } };
    case "replace": return action.payload;
    default: return state;
  }
}

// ----------------------------- Calculations ---------------------------------
function usePlan(expenses, settings) {
  const today = new Date();
  const cycleDays = getCycleDays(settings, today);
  const perExpense = expenses.map((e) => {
    const evenDaily = e.amount / cycleDays;
    const untilDueDaily = e.amount / daysUntilDue(e.dueDay, today);
    const daily = settings.allocationMode === "even" ? evenDaily : untilDueDaily;
    return { ...e, evenDaily, untilDueDaily, daily };
  });
  const totals = perExpense.reduce((acc, e) => ({ monthly: acc.monthly + e.amount, daily: acc.daily + e.daily }), { monthly: 0, daily: 0 });
  const dailyIncome = settings.monthlyIncome / cycleDays;
  const payToday = perExpense.map((e) => ({ id: e.id, name: e.name, amount: e.daily }));
  const chart = Array.from({ length: cycleDays }, (_, i) => { const d = i + 1; return { day: d, balance: dailyIncome * d - totals.daily * d }; });
  return { today, cycleDays, perExpense, totals, dailyIncome, payToday, chart };
}

// ----------------------------- UI Bits --------------------------------------
function Input({ label, hint, value, onChange, type = "text", min, max, step }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 inline-flex items-center gap-2 font-medium">{label}{hint && <em className="ml-2 text-xs font-normal opacity-70">{hint}</em>}</span>
      <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 outline-none ring-0 transition focus:border-white/30 focus:bg-white/10" value={value} onChange={(e) => onChange(type === "number" ? safeParseCurrency(e.target.value) : e.target.value)} type={type} min={min} max={max} step={step} />
    </label>
  );
}
function NiceCard({ children, className = "" }) { return <div className={`rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm ${className}`}>{children}</div>; }

function ExportButton({ state }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20" onClick={() => { const data = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state, null, 2))}`; const a = document.createElement("a"); a.href = data; a.download = `phoenix-plan-${new Date().toISOString().slice(0, 10)}.json`; a.click(); }} title="Export your plan to JSON">
      <Icons.Download /> Export
    </button>
  );
}
function ImportButton({ onLoad }) {
  const ref = useRef(null);
  return (<>
    <input ref={ref} type="file" accept="application/json" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { onLoad(JSON.parse(String(reader.result))); } catch { alert("Invalid JSON"); } }; reader.readAsText(file); }} />
    <button className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20" onClick={() => ref.current?.click()} title="Import a saved plan"><Icons.Upload /> Import</button>
  </>);
}

// ----------------------------- Library (Combined) ---------------------------
// Seed library from earlier + merged guide highlights from uploaded MD/HTML docs.
const LIBRARY = [
  { id: "auto-sink", title: "Use automatic sinking funds", body: "Create separate buckets for each bill and move the daily amount automatically. Most banks support multiple savings vaults and scheduled transfers.", tags: ["automation", "banking"], link: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-sinking-fund-en-2211/" },
  { id: "snowball", title: "Debt snowball vs avalanche", body: "Snowball (smallest first) builds momentum; Avalanche (highest APR first) saves interest. Choose the one you’ll actually stick with.", tags: ["debt", "strategy"], link: "https://www.investopedia.com/terms/d/debt_snowball.asp" },
  { id: "round-up", title: "Round-ups & micro-payments", body: "Round each daily transfer up to the nearest dollar to build a buffer and prevent odd-cent failures.", tags: ["habits"], link: "https://www.nerdwallet.com/article/banking/round-up-savings" },
  { id: "emergency", title: "Build a one-month cushion", body: "Before aggressive payoff, aim for one month of core expenses saved. It prevents setbacks from turning into new debt.", tags: ["safety", "savings"], link: "https://www.consumerfinance.gov/ask-cfpb/how-much-should-i-have-in-my-emergency-fund-en-289/" },
  // From guides: Garnishment & ZBB
  { id: "garnishment", title: "The Garnishment Gauntlet", body: "Treat garnishment as a fixed expense; understand disposable earnings and legal limits. Align due dates after paydays to ease cash flow.", tags: ["triage", "cashflow"], link: "https://consumer.ftc.gov/articles/wage-garnishment" },
  { id: "zbb", title: "Turnaround Budget (Zero-Based)", body: "Budget every dollar using your most conservative income. Pair with a Surplus strategy: live on baseline; deploy any extra to emergency fund, debt, then buffer.", tags: ["budget", "zbb"], link: "https://www.nerdwallet.com/article/finance/zero-based-budgeting-explained" },
  // Credit rebuild
  { id: "credit-builder", title: "Rebuilding Toolkit", body: "Start with a credit-builder loan, then add a low-fee secured card. Automate payment-in-full and keep utilization <10%.", tags: ["credit", "fico"], link: "https://www.experian.com/blogs/ask-experian/what-is-a-credit-builder-loan/" },
  { id: "authorized-user", title: "Authorized user (trusted only)", body: "Piggyback on a trusted, long-aged, low-utilization account. Do not buy tradelines; keep no card access.", tags: ["credit"], link: "https://www.bankrate.com/finance/credit-cards/being-an-authorized-user/" },
  { id: "disputes-goodwill", title: "Clean Slate (disputes & goodwill)", body: "Dispute factual errors formally; for one-off lates, send goodwill letters with proof and persistence.", tags: ["credit", "cleanup"], link: "https://www.consumerfinance.gov/ask-cfpb/how-do-i-dispute-an-error-on-my-credit-report-en-314/" },
  // Growth & safety net
  { id: "snow-lanche", title: "Debt 'Snow-Lanche' Hybrid", body: "Knock out 1–2 small debts (Snowball) then switch to Avalanche for minimal interest.", tags: ["debt"], link: "https://www.youtube.com/watch?v=sI_1A8k2j6s" },
  { id: "index-etf", title: "One-fund investing start", body: "A low-cost total-market ETF (VTI/VT) gives instant diversification. Max employer match, then Roth IRA, then 401(k).", tags: ["investing"], link: "https://www.investopedia.com/terms/i/indexfund.asp" },
  { id: "safety-net", title: "Build a safety net", body: "Health, disability, and term life are core assets that protect the plan and your dependents.", tags: ["risk"], link: "https://www.iii.org" },
  { id: "business-credit", title: "Two-track: Build business credit", body: "Form LLC, get EIN + D-U-N-S, add net-30 vendor tradelines, then no-PG business card; separate from personal credit.", tags: ["business", "credit"], link: "https://www.dnb.com/duns-number.html" },
];

// ----------------------------- Charts ---------------------------------------
function AreaChartMini({ data, width = 600, height = 180, stroke = "#fb923c", fill = "#fb923c55" }) {
  if (!data.length) return null; const w = width, h = height, pad = 24;
  const x = (i) => pad + (i * (w - pad * 2)) / (data.length - 1);
  const [min, max] = data.reduce((acc, d) => [Math.min(acc[0], d.balance), Math.max(acc[1], d.balance)], [Infinity, -Infinity]);
  const y = (v) => pad + (h - pad * 2) * (1 - (v - min) / (max - min || 1));
  const dPath = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.balance)}`).join(" ");
  const area = `${dPath} L ${pad + (w - pad * 2)},${h - pad} L ${pad},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <g fill="none" stroke="white" opacity="0.15"><line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} /><line x1={pad} y1={pad} x2={pad} y2={h - pad} /></g>
      <path d={area} fill={fill} /><path d={dPath} stroke={stroke} fill="none" />
    </svg>
  );
}
function BalanceChartJS({ plan }) {
  const ref = useRef(null); const chartRef = useRef(null);
  const data = useMemo(() => {
    const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
    return plan.chart.map((pt, i) => ({ x: new Date(start.getTime() + i * 86400000), y: pt.balance }));
  }, [plan.chart]);
  useEffect(() => { let destroyed = false; loadChartFromCDN().then((Chart) => {
    if (!ref.current || !Chart) return; const ctx = ref.current.getContext("2d"); if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ctx, { type: 'line', data: { datasets: [{ label: 'Balance', data, borderColor: 'rgba(249,115,22,1)', backgroundColor: 'rgba(249,115,22,0.2)', fill: true, tension: 0.35 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, parsing: false, scales: { x: { type: 'time', time: { unit: 'day' }, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.1)' } }, y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.1)' } } } }});
  }).catch(() => {});
  return () => { if (chartRef.current && !destroyed) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [data]);
  return <canvas ref={ref} className="w-full h-48 rounded-2xl" aria-label="Balance Chart" />;
}

// ----------------------------- App -----------------------------------------
const CATEGORIES = "Housing Utilities Transport Debt Subscriptions Other".split(" ");
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => { try { const saved = localStorage.getItem("phoenix-plan"); if (saved) dispatch({ type: "replace", payload: JSON.parse(saved) }); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("phoenix-plan", JSON.stringify(state)); } catch {} }, [state]);

  const plan = usePlan(state.expenses, state.settings);
  const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [libQuery, setLibQuery] = useState("");
  const libFiltered = useMemo(() => { const q = libQuery.toLowerCase(); return LIBRARY.filter((x) => [x.title, x.body, x.tags.join(" ")].join(" ").toLowerCase().includes(q)); }, [libQuery]);

  const rounded = (n) => (state.settings.roundTo === "dollar" ? Math.ceil(n) : Math.round(n * 100) / 100);
  const todayTotal = plan.payToday.reduce((s, x) => s + x.amount, 0);
  const addExpense = () => dispatch({ type: "add", payload: { id: uid(), name: "New Expense", amount: 0, dueDay: 1, category: "Other" } });

  const categoryData = useMemo(() => {
    const map = {}; for (const e of state.expenses) { const key = e.category; map[key] = map[key] || { category: key, daily: 0 }; map[key].daily += e.amount / plan.cycleDays; } return Object.values(map);
  }, [state.expenses, plan.cycleDays]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f12] via-[#111117] to-[#0b0c10] text-white">
      <Embers active={!prefersReduced} />
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-black/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3"><PhoenixLogo className="h-10 w-10" /><div><div className="text-xs tracking-wider text-orange-300/80">THE</div><h1 className="bg-gradient-to-r from-orange-300 via-orange-400 to-red-400 bg-clip-text text-2xl font-extrabold tracking-wide text-transparent">PHOENIX PLAN</h1></div></div>
          <div className="flex items-center gap-2"><ExportButton state={state} /><ImportButton onLoad={(data) => dispatch({ type: "replace", payload: data })} /></div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-12">
        {/* Controls */}
        <section className="md:col-span-4 space-y-4">
          <NiceCard>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider opacity-80"><Icons.Wallet /> Income & Settings</div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Monthly Income (take-home)" value={state.settings.monthlyIncome} onChange={(v) => dispatch({ type: "settings", patch: { monthlyIncome: fmt(v) } })} type="number" step="0.01" />
              <label className="block text-sm"><span className="mb-1 inline-flex items-center gap-2 font-medium">Cycle Length</span><select className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2" value={state.settings.cycleMode} onChange={(e) => dispatch({ type: "settings", patch: { cycleMode: e.target.value } })}><option value="actual">Actual month days</option><option value="thirty">Fixed 30 days</option></select></label>
              <label className="block text-sm"><span className="mb-1 inline-flex items-center gap-2 font-medium">Allocation</span><select className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2" value={state.settings.allocationMode} onChange={(e) => dispatch({ type: "settings", patch: { allocationMode: e.target.value } })}><option value="even">Even across month</option><option value="untilDue">Accelerate until due</option></select></label>
              <label className="block text-sm"><span className="mb-1 inline-flex items-center gap-2 font-medium">Rounding</span><select className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2" value={state.settings.roundTo} onChange={(e) => dispatch({ type: "settings", patch: { roundTo: e.target.value } })}><option value="cent">Nearest cent</option><option value="dollar">Round up to dollar</option></select></label>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-white/5 p-3"><div className="opacity-70">Cycle days</div><div className="text-xl font-bold">{plan.cycleDays}</div></div><div className="rounded-2xl bg-white/5 p-3"><div className="opacity-70">Daily income</div><div className="text-xl font-bold">{asCurrency(plan.dailyIncome)}</div></div></div>
          </NiceCard>

          <NiceCard>
            <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider opacity-80"><Icons.Dollar /> Expenses</div><button onClick={addExpense} className="inline-flex items-center gap-1 rounded-2xl bg-orange-500/20 px-3 py-1 text-sm text-orange-200 hover:bg-orange-500/30"><Icons.Plus /> Add</button></div>
            <div className="space-y-3">
              {state.expenses.map((e) => (
                <div key={e.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="grid grid-cols-12 gap-2">
                    <input className="col-span-5 rounded-xl bg-black/20 px-3 py-2 outline-none" value={e.name} onChange={(ev) => dispatch({ type: "update", id: e.id, patch: { name: ev.target.value } })} />
                    <input className="col-span-3 rounded-xl bg-black/20 px-3 py-2" value={e.amount} type="number" step="0.01" onChange={(ev) => dispatch({ type: "update", id: e.id, patch: { amount: fmt(safeParseCurrency(ev.target.value)) } })} />
                    <div className="col-span-2 flex items-center gap-2 rounded-xl bg-black/20 px-3 py-2"><Icons.Calendar className="h-4 w-4 opacity-70" /><input className="w-full bg-transparent outline-none" value={e.dueDay} type="number" min={1} max={31} onChange={(ev) => dispatch({ type: "update", id: e.id, patch: { dueDay: clamp(Number(ev.target.value || 1), 1, 31) } })} /></div>
                    <select className="col-span-1 rounded-xl bg-black/20 px-2 py-2 text-xs" value={e.category} onChange={(ev) => dispatch({ type: "update", id: e.id, patch: { category: ev.target.value } })}>{CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}</select>
                    <button className="col-span-1 rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/30" onClick={() => dispatch({ type: "remove", id: e.id })}><Icons.Trash className="mx-auto" /></button>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl bg-black/20 p-2">Monthly: <strong>{asCurrency(e.amount)}</strong></div>
                    <div className="rounded-xl bg-black/20 p-2">Even daily: <strong>{asCurrency(e.amount / plan.cycleDays)}</strong></div>
                    <div className="rounded-xl bg-black/20 p-2">Until due daily: <strong>{asCurrency(e.amount / daysUntilDue(e.dueDay, plan.today))}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </NiceCard>
        </section>

        {/* Insights & Plan */}
        <section className="md:col-span-8 space-y-4">
          <NiceCard>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider opacity-80"><Icons.Trend /> Your Daily Plan</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/5 p-3"><div className="opacity-70">Total monthly bills</div><div className="text-2xl font-bold">{asCurrency(plan.totals.monthly)}</div></div>
              <div className="rounded-2xl bg-white/5 p-3"><div className="opacity-70">Daily needed for bills</div><div className="text-2xl font-bold">{asCurrency(plan.totals.daily)}</div></div>
              <div className="rounded-2xl bg-white/5 p-3"><div className="opacity-70">Daily income</div><div className="text-2xl font-bold">{asCurrency(plan.dailyIncome)}</div></div>
              <div className={`rounded-2xl p-3 ${plan.dailyIncome - plan.totals.daily >= 0 ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
                <div className="opacity-70">Daily buffer</div><div className="text-2xl font-bold">{asCurrency(plan.dailyIncome - plan.totals.daily)}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-3"><div className="mb-2 text-sm opacity-80">Balance trajectory this month</div><div className="h-48"><AreaChartMini data={plan.chart} /></div></div>
              <div className="rounded-2xl bg-white/5 p-3"><div className="mb-2 text-sm opacity-80">Balance (exportable)</div><div className="h-48"><BalanceChartJS plan={plan} /></div></div>
            </div>
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 p-4">
              <div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"><Icons.Sparkles /> Today’s transfers (daily chip-away)</div><div className="text-sm opacity-80">Total: <strong>{asCurrency(rounded(todayTotal))}</strong></div></div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {plan.perExpense.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm"><div className="truncate pr-2">{e.name}</div><div className="text-right"><div>{asCurrency(rounded(e.daily))}</div><div className="text-xs opacity-70">{state.settings.allocationMode === "even" ? "even" : "until due"}</div></div></div>
                ))}
              </div>
              <div className="mt-2 text-xs opacity-80">Tip: Create a Bills vault and schedule a daily transfer for this total; keep each bill on autopay for its due date.</div>
            </div>
          </NiceCard>

          <NiceCard>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider opacity-80"><Icons.Book /> Interactive Library & Guides</div>
            <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3"><input className="rounded-2xl bg-white/5 px-3 py-2 text-sm outline-none" placeholder="Search tips (eg. automation, credit, debt)" value={libQuery} onChange={(e) => setLibQuery(e.target.value)} /><div className="col-span-2 text-sm opacity-80">Curated, actionable ideas to make the plan effortless.</div></div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {libFiltered.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-1 text-sm font-semibold">{item.title}</div>
                  <p className="text-sm opacity-80">{item.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">{item.tags.map((t) => (<span key={t} className="rounded-full bg-black/20 px-2 py-0.5 text-xs opacity-80">#{t}</span>))}<a href={item.link} target="_blank" rel="noreferrer" className="ml-auto text-xs text-orange-300 underline">Open guide →</a></div>
                </div>
              ))}
            </div>
          </NiceCard>

          <NiceCard>
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-80">How to pay (per expense)</div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {plan.perExpense.map((e) => (
                <div key={e.id} className="rounded-2xl bg-white/5 p-3">
                  <div className="mb-1 flex items-center justify-between text-sm font-semibold"><div className="truncate pr-2">{e.name}</div><span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">Due {e.dueDay}</span></div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-xl bg-black/20 p-2">Daily <strong className="block">{asCurrency(rounded(e.daily))}</strong></div>
                    <div className="rounded-xl bg-black/20 p-2">Weekly <strong className="block">{asCurrency(rounded(e.daily * 7))}</strong></div>
                    <div className="rounded-xl bg-black/20 p-2">Bi-weekly <strong className="block">{asCurrency(rounded(e.daily * 14))}</strong></div>
                  </div>
                  <div className="mt-2 text-xs opacity-80">Schedule a transfer for one of these frequencies into your Bills vault; keep the bill’s autopay on its due date.</div>
                </div>
              ))}
            </div>
          </NiceCard>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-10"><div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-xs opacity-80">Unified build: React + SVG charts + Chart.js (CDN) + p5 (CDN). Responsive, keyboard-friendly. Data stays in your browser.</div></footer>
    </div>
  );
}

// ----------------------------- Self Tests -----------------------------------
function assert(name, cond) { if (!cond) console.error(`❌ ${name}`); else console.log(`✅ ${name}`); }
function runTests() {
  const today = new Date(2025, 4, 15);
  // daysInMonth
  assert("daysInMonth Feb 2024 is 29", daysInMonth(2024, 1) === 29);
  assert("daysInMonth Sep 2025 is 30", daysInMonth(2025, 8) === 30);
  assert("daysInMonth Feb 2025 is 28", daysInMonth(2025, 1) === 28);
  // getCycleDays
  assert('getCycleDays("thirty") returns 30', getCycleDays({ cycleMode: "thirty" }, today) === 30);
  assert('getCycleDays("actual") returns 31 for May 2025', getCycleDays({ cycleMode: "actual" }, today) === 31);
  // daysUntilDue
  assert("daysUntilDue later this month (20th)", daysUntilDue(20, today) === 6);
  assert("daysUntilDue wraps to next month (10th)", daysUntilDue(10, today) === 26);
  assert("daysUntilDue when due today => 1", daysUntilDue(15, today) === 1);
  // helpers
  assert("safeParseCurrency $1,234.56", Math.abs(safeParseCurrency("$1,234.56") - 1234.56) < 1e-9);
  assert("clamp upper bound", clamp(40, 1, 31) === 31);
  // plan math
  const expenses = [ { id: "1", name: "Car", amount: 300, dueDay: 20, category: "T" }, { id: "2", name: "Net", amount: 60, dueDay: 10, category: "U" } ];
  const settings = { monthlyIncome: 3600, cycleMode: "thirty", allocationMode: "even", roundTo: "cent", showWeekends: true };
  const cd = getCycleDays(settings, today); const totalDaily = expenses.reduce((s, e) => s + e.amount / cd, 0);
  assert("cycleDays for thirty is 30", cd === 30);
  assert("totalDaily sum is 12", Math.abs(totalDaily - 12) < 1e-9);
}
const __DEV__ = (typeof process !== "undefined" && process.env && process.env.NODE_ENV && process.env.NODE_ENV !== "production") || (typeof window !== "undefined" && /localhost|127\.0\.0\.1/.test((window.location && window.location.host) || ""));
if (__DEV__) { try { runTests(); } catch (e) { console.error("Test harness error", e); } }
