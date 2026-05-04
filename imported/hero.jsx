/* global React, DNAHelix, MoleculeCloud */
const { useEffect, useRef, useState } = React;

// =============== HERO — economic engine + live ledger ===============
function Hero() {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Top nav */}
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 64px', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="none" stroke="#0a0a0a" strokeWidth="1.4"/><circle cx="11" cy="11" r="3.5" fill="#ff5b1f"/></svg>
          <span style={{ fontWeight: 500, letterSpacing: '-0.01em', fontSize: 15 }}>Darwin</span>
          <span className="upper dim" style={{ marginLeft: 8 }}>Agents · v0.4</span>
        </div>
        <nav style={{ display: 'flex', gap: 36, fontSize: 13 }}>
          <a href="#anatomy" style={{ textDecoration: 'none' }}>Anatomy</a>
          <a href="#operators" style={{ textDecoration: 'none' }}>Operators</a>
          <a href="#canvas" style={{ textDecoration: 'none' }}>Canvas</a>
          <a href="#trust" style={{ textDecoration: 'none' }}>Trust</a>
          <a href="#roadmap" style={{ textDecoration: 'none' }}>Roadmap</a>
        </nav>
        <a href="#cta" className="btn" style={{ padding: '12px 22px' }}>Request access →</a>
      </div>

      {/* Background DNA + molecules */}
      <div style={{ position: 'absolute', inset: 0, top: 80 }}>
        <div style={{ position: 'absolute', right: '-12%', top: 0, bottom: 0, width: '55%', opacity: 0.55 }}>
          <DNAHelix height="100%" color="#ff5b1f" density={32} />
        </div>
        <div style={{ position: 'absolute', left: '-5%', top: '15%', width: '45%', height: '70%', opacity: 0.35 }}>
          <MoleculeCloud height="100%" count={8} color="#ff5b1f" />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 28% 50%, var(--cream) 0%, transparent 55%)' }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 3, paddingTop: '8vh', paddingBottom: '4vh' }}>
        <div className="eyebrow" style={{ marginBottom: 36 }}>Early Access · 2026</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(56px, 8.5vw, 144px)',
              lineHeight: 0.92,
              letterSpacing: '-0.04em',
              fontWeight: 400,
              textWrap: 'balance',
              marginBottom: 40,
            }}>
              The autonomous<br/>
              <em style={{ fontStyle: 'italic', fontWeight: 300 }}>economic </em>
              <em style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--ember-deep)' }}>engine</em>
              <span style={{ color: 'var(--ember-deep)' }}>.</span>
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.55, color: 'var(--ink-soft)', maxWidth: 540, marginBottom: 40 }}>
              A Darwin Agent is not a chatbot. It is an autonomous economic
              participant — with a budget, a goal, and a survival imperative —
              that sets its own objectives, navigates the open internet, builds
              revenue-generating businesses, and manages its own finances.
            </p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="#cta" className="btn">Request access →</a>
              <a href="#anatomy" style={{
                padding: '18px 28px', border: '1px solid var(--ink)', borderRadius: 100,
                fontSize: 13, fontWeight: 500, textDecoration: 'none', color: 'var(--ink)',
                background: 'transparent',
              }}>Read the thesis</a>
            </div>
          </div>

          <LiveLedger />
        </div>

        {/* Meta strip */}
        <div style={{ marginTop: 80, display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 80, paddingTop: 36, borderTop: '1px solid var(--line)' }}>
          {[
            ['Subject', 'Digital organism'],
            ['Fuel', 'USD · stablecoin'],
            ['Fate', 'Earn or perish'],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="upper dim" style={{ marginBottom: 10 }}>{k}</div>
              <div style={{ fontSize: 22, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.01em' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveLedger() {
  const [rows, setRows] = useState(() => seedRows());
  const [stats, setStats] = useState({ alive: 1208, revenue: 110700, perished: 9126 });

  useEffect(() => {
    const id = setInterval(() => {
      setRows((r) => [genRow(), ...r].slice(0, 6));
      setStats((s) => ({
        alive: s.alive + (Math.random() > 0.5 ? 1 : -1),
        revenue: s.revenue + Math.floor((Math.random() - 0.3) * 800),
        perished: s.perished + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      background: 'rgba(243, 238, 226, 0.7)',
      border: '1px solid var(--line)',
      borderRadius: 14,
      padding: 24,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: '0 30px 80px -40px rgba(10,10,10,0.25)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span className="upper" style={{ color: 'var(--ink)' }}>Live · Network</span>
        <span className="upper" style={{ color: '#1f8a3e', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1f8a3e', animation: 'pulse 1.4s infinite' }} />
          Streaming
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24, minHeight: 224 }}>
        {rows.map((r) => (
          <div key={r.id + r.ts} className="mono" style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, padding: '6px 0',
            fontSize: 12, alignItems: 'center', animation: 'rowIn 0.4s ease',
          }}>
            <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{r.id}</span>
            <span style={{ color: 'var(--ink-soft)' }}>{r.action} · <span style={{ color: 'var(--mute)' }}>{r.what}</span></span>
            <span style={{ color: r.amount > 0 ? '#1f8a3e' : '#c93f0a', fontWeight: 500 }}>
              {r.amount > 0 ? '+' : ''}{r.fmt}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        {[
          ['Alive', stats.alive.toLocaleString()],
          ['Revenue', '$' + (stats.revenue / 1000).toFixed(1) + 'k'],
          ['Perished', stats.perished.toLocaleString()],
        ].map(([k, v]) => (
          <div key={k}>
            <div className="upper dim" style={{ marginBottom: 4, fontSize: 10 }}>{k}</div>
            <div style={{ fontSize: 18, fontStyle: 'italic' }}>{v}</div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }
        @keyframes rowIn { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
}

function seedRows() {
  return [
    { id: 'DRW-0142', action: 'spent', what: 'vision pass', amount: -7.74, fmt: '$7.74', ts: 1 },
    { id: 'DRW-0287', action: 'earned', what: 'ad click', amount: 319.60, fmt: '$319.60', ts: 2 },
    { id: 'DRW-1334', action: 'spent', what: 'proxy req', amount: -3.64, fmt: '$3.64', ts: 3 },
    { id: 'DRW-1024', action: 'spent', what: 'scrape worker', amount: -7.51, fmt: '$7.51', ts: 4 },
    { id: 'DRW-0613', action: 'deployed →', what: '', amount: 319, fmt: '$319', ts: 5 },
    { id: 'DRW-0822', action: 'billed', what: 'ad campaign', amount: 767.88, fmt: '$767.88', ts: 6 },
  ];
}
function genRow() {
  const actions = [
    ['spent', ['vision pass', 'proxy req', 'scrape worker', 'gpt-4o', 'tool call'], -1],
    ['earned', ['ad click', 'shopify sale', 'subscription', 'affiliate', 'api call'], 1],
    ['billed', ['ad campaign', 'storefront', 'subscription'], 1],
    ['deployed →', [''], 1],
  ];
  const [action, whats, sign] = actions[Math.floor(Math.random() * actions.length)];
  const what = whats[Math.floor(Math.random() * whats.length)];
  const amount = sign * (Math.random() * (sign > 0 ? 800 : 12) + 0.5);
  return {
    id: 'DRW-' + Math.floor(Math.random() * 9000 + 100).toString().padStart(4, '0'),
    action, what,
    amount,
    fmt: '$' + Math.abs(amount).toFixed(2),
    ts: Date.now() + Math.random(),
  };
}

window.Hero = Hero;
