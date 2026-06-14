import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';

/* ─────────────────────────── helpers ─────────────────────────── */
const RISK_COLOR = { HIGH: '#f43f5e', MEDIUM: '#fbbf24', LOW: '#10b981' };
const RISK_BG    = { HIGH: 'rgba(244,63,94,0.08)', MEDIUM: 'rgba(251,191,36,0.08)', LOW: 'rgba(16,185,129,0.08)' };

function Badge({ label, color, bg }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '12px',
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: color || '#fff',
      background: bg || 'rgba(99,102,241,0.15)',
      border: `1px solid ${color || 'rgba(99,102,241,0.3)'}`,
    }}>
      {label}
    </span>
  );
}

function Section({ title, icon, children, defaultOpen = false, accent = 'var(--primary)' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '10px',
      background: 'var(--bg-panel)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontWeight: 600,
          fontSize: '0.9rem',
          gap: '10px',
          borderLeft: `3px solid ${accent}`,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>{icon}</span>
          {title}
        </span>
        <span style={{ fontSize: '0.8rem', opacity: 0.5, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function IssueList({ items, emptyMsg = 'No issues found.' }) {
  if (!items || items.length === 0) {
    return <p style={{ color: '#10b981', fontStyle: 'italic', margin: 0 }}>✓ {emptyMsg}</p>;
  }
  return (
    <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: '4px', lineHeight: 1.5 }}>
          {typeof item === 'string' ? item : (
            <span>
              {item.line && <Badge label={`L${item.line}`} color="#6366f1" bg="rgba(99,102,241,0.1)" />}{' '}
              {item.severity && <Badge label={item.severity} color={RISK_COLOR[item.severity] || '#aaa'} bg={RISK_BG[item.severity] || 'rgba(0,0,0,0.05)'} />}{' '}
              <span style={{ color: 'var(--text-primary)' }}>{item.issue || item.message || JSON.stringify(item)}</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function ComplexityBadge({ label, value }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'rgba(99,102,241,0.08)', borderRadius: '10px', padding: '12px 20px',
      border: '1px solid rgba(99,102,241,0.2)', flex: 1,
    }}>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</span>
      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{value || '—'}</span>
    </div>
  );
}

/* ─────────────────────────── main component ─────────────────────────── */
export default function ReviewPanel({ editorRef, playback, isDarkMode }) {
  const [isLoading, setIsLoading]   = useState(false);
  const [report, setReport]         = useState(null);
  const [error, setError]           = useState(null);
  const [isOpen, setIsOpen]         = useState(false);

  const handleReview = async () => {
    const code = editorRef?.current?.getValue?.() || '';
    if (!code.trim()) {
      setError('No code in the editor to review.');
      return;
    }

    const trace = playback?.steps || [];

    setIsLoading(true);
    setError(null);
    setReport(null);
    setIsOpen(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, trace }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setReport(data);
    } catch (e) {
      setError(e.message || 'Unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const riskLevel = report?.security?.risk_level || 'LOW';

  return (
    <>
      {/* Floating "Review Code" trigger button */}
      <button
        id="ai-review-btn"
        onClick={handleReview}
        disabled={isLoading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: isLoading
            ? 'rgba(99,102,241,0.5)'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          border: 'none',
          padding: '10px 18px',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: isLoading ? 'wait' : 'pointer',
          fontSize: '0.88rem',
          boxShadow: '0 4px 15px rgba(99,102,241,0.35)',
          transition: 'all 0.25s ease',
          whiteSpace: 'nowrap',
        }}
        title="Run Agentic AI Code Review"
      >
        {isLoading ? (
          <>
            <span className="review-spinner" />
            Reviewing…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
            </svg>
            AI Review
          </>
        )}
      </button>

      {/* Slide-in panel */}
      {isOpen && (
        <div
          id="ai-review-panel"
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '480px',
            height: '100vh',
            background: 'var(--bg-panel)',
            borderLeft: '1px solid var(--border-color)',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Panel Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem',
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>AI Code Review</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Powered by Gemini 2.5 Flash</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1,
                padding: '4px 8px', borderRadius: '6px',
              }}
            >✕</button>
          </div>

          {/* Panel Body — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {/* Loading state */}
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔍</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Agent is reviewing your code…
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Running syntax analysis, complexity estimation,<br/>
                  security scan, trace analysis, and Gemini review…
                </div>
                <div className="review-progress-bar" style={{ marginTop: '24px' }} />
              </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <div style={{
                background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
                borderRadius: '10px', padding: '16px', marginBottom: '16px',
              }}>
                <div style={{ color: '#f43f5e', fontWeight: 600, marginBottom: '6px' }}>⚠ Review Failed</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{error}</div>
              </div>
            )}

            {/* Report sections */}
            {report && !isLoading && (
              <>
                {/* Summary ribbon */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
                  border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '14px',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Overall Assessment</div>
                  <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.88rem' }}>
                    {report.code_quality?.summary || 'Review complete.'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <Badge label={`Risk: ${riskLevel}`} color={RISK_COLOR[riskLevel]} bg={RISK_BG[riskLevel]} />
                    {report.complexity?.time && <Badge label={report.complexity.time} color="#6366f1" bg="rgba(99,102,241,0.1)" />}
                    {report.optimization?.current_algorithm && <Badge label={report.optimization.current_algorithm} color="#8b5cf6" bg="rgba(139,92,246,0.1)" />}
                  </div>
                </div>

                {/* 1 — Complexity */}
                <Section title="Complexity Analysis" icon="📊" defaultOpen={true} accent="#6366f1">
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <ComplexityBadge label="Time" value={report.complexity?.time} />
                    <ComplexityBadge label="Space" value={report.complexity?.space} />
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{report.complexity?.explanation}</p>
                </Section>

                {/* 2 — Code Quality */}
                <Section title="Code Quality" icon="✍️" defaultOpen={true} accent="#8b5cf6">
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '0.82rem' }}>Readability</div>
                    <p style={{ margin: 0, lineHeight: 1.6 }}>{report.code_quality?.readability}</p>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '0.82rem' }}>Naming Conventions</div>
                    <p style={{ margin: 0, lineHeight: 1.6 }}>{report.code_quality?.naming_conventions}</p>
                  </div>
                  {report.code_quality?.issues?.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', fontSize: '0.82rem' }}>Issues</div>
                      <IssueList items={report.code_quality.issues} />
                    </div>
                  )}
                </Section>

                {/* 3 — Security */}
                <Section title="Security Scan" icon="🔒" accent={RISK_COLOR[riskLevel] || '#10b981'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Risk Level:</span>
                    <Badge label={riskLevel} color={RISK_COLOR[riskLevel]} bg={RISK_BG[riskLevel]} />
                  </div>
                  <IssueList
                    items={report.security?.findings || []}
                    emptyMsg="No security issues detected."
                  />
                </Section>

                {/* 4 — Runtime Analysis */}
                <Section title="Runtime Analysis" icon="⏱️" accent="#06b6d4">
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, background: 'rgba(6,182,212,0.08)', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid rgba(6,182,212,0.15)' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#06b6d4' }}>{report.runtime_analysis?.total_swaps ?? '—'}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Swaps</div>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(6,182,212,0.08)', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid rgba(6,182,212,0.15)' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#06b6d4' }}>{report.runtime_analysis?.total_comparisons ?? '—'}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Comparisons</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{report.runtime_analysis?.observation}</p>
                </Section>

                {/* 5 — Optimization */}
                <Section title="Optimization Suggestions" icon="⚡" accent="#f59e0b">
                  <div style={{ marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Current:</span>
                    <Badge label={report.optimization?.current_algorithm || '—'} color="#f59e0b" bg="rgba(245,158,11,0.1)" />
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <Badge label={report.optimization?.suggested_algorithm || 'No change'} color="#10b981" bg="rgba(16,185,129,0.1)" />
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{report.optimization?.expected_improvement}</p>
                </Section>

                {/* 6 — Improved Code */}
                <Section title="Improved Code" icon="🛠️" accent="#10b981">
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginTop: '4px' }}>
                    <Editor
                      height="300px"
                      language="python"
                      theme={isDarkMode ? 'vs-dark' : 'vs'}
                      value={report.optimized_code || report.improved_code || '# No improved code returned.'}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        folding: false,
                      }}
                    />
                  </div>
                </Section>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
