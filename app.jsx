import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const presets = {
  handwash: {
    claim: 'Washing hands with soap and water helps remove germs.',
    audience: 'Families and community volunteers',
    objective: 'remind',
    culturalSeed: '',
    culturalType: 'artist'
  }
};

function Mark() {
  return <span className="brand-mark" aria-hidden="true"><i/><i/><i/><b/></span>;
}

function Badge({ children, kind = '' }) { return <span className={`badge ${kind}`}>{children}</span>; }

function App() {
  const [form, setForm] = useState({ ...presets.handwash });
  const [mode, setMode] = useState('live');
  const [health, setHealth] = useState(null);
  const [run, setRun] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [approved, setApproved] = useState(false);
  const [drafts, setDrafts] = useState({ baseline: '', adapted: '' });
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/health').then((r) => r.json()).then(setHealth).catch(() => setHealth({ status: 'offline', providers: { qloo: false, gemini: false } }));
  }, []);

  const change = (key) => (event) => setForm((old) => ({ ...old, [key]: event.target.value }));

  async function submit(event, requestedMode = mode) {
    event?.preventDefault();
    setBusy(true); setError(''); setRun(null); setApproved(false); setCopied('');
    try {
      const response = await fetch('/api/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, mode: requestedMode })
      });
      const data = await response.json();
      if (!response.ok) {
        setRun({ trace: data.trace || [] });
        throw new Error(data.error || 'The workflow could not be completed.');
      }
      setRun(data);
      setDrafts({ baseline: data.drafts.baseline, adapted: data.drafts.adapted });
      setMode(requestedMode);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function copyDraft(which = 'adapted') {
    try { await navigator.clipboard.writeText(drafts[which]); setCopied(which); setTimeout(() => setCopied(''), 1800); }
    catch { setError('Clipboard access is unavailable in this browser. Select and copy the message manually.'); }
  }

  function exportPackage() {
    if (!run) return;
    const packageText = [
      'TRUSTWEAVE — HUMAN REVIEW PACKAGE',
      `Run: ${run.runId}`,
      `Mode: ${run.mode === 'live' ? 'Live Qloo + Gemini' : 'Illustrative sample data'}`,
      `Assessment: ${run.assessment.label}`,
      `Audience: ${form.audience}`,
      `Submitted claim: ${form.claim}`,
      `Source: ${run.evidence.title} (${run.evidence.url})`,
      '', 'BASELINE MESSAGE', drafts.baseline, '', 'CULTURALLY INFORMED MESSAGE', drafts.adapted,
      '', 'REVIEW REQUIRED — This package is not an approved public-health notice.'
    ].join('\n');
    const url = URL.createObjectURL(new Blob([packageText], { type: 'text/plain' }));
    const a = document.createElement('a'); a.href = url; a.download = `trustweave-review-${run.runId.slice(0, 8)}.txt`; a.click(); URL.revokeObjectURL(url);
  }

  const qlooReady = Boolean(health?.providers?.qloo);
  const geminiReady = Boolean(health?.providers?.gemini);

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="TrustWeave home"><Mark/><span>trustweave</span></a>
      <nav className="topnav" aria-label="Main navigation"><a href="#workflow">Workflow</a><a href="#about">About</a></nav>
      <div className="provider-status" title="Provider configuration is checked by the server">
        <span className={`status-dot ${qlooReady && geminiReady ? 'is-ready' : ''}`}/>
        {qlooReady && geminiReady ? 'Live providers ready' : 'Connect providers'}
      </div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-rule"/> FROM TRUSTED SOURCES TO EVERYDAY CONVERSATION</div>
          <h1>Help good advice reach<br/><em>the people who need it.</em></h1>
          <p>Start with a trusted source. Shape a message for the people who need it. Keep the evidence in view and the final decision in human hands.</p>
          <a className="hero-link" href="#workflow">Build a message <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-art" aria-label="An example public information note, linked to its source">
          <div className="field-note"><div className="note-topline"><span>FIELD NOTE&nbsp; / &nbsp;01</span><span className="note-stamp">SOURCE CHECKED</span></div><div className="note-rule"/><p className="note-quote">“Soap and water help remove germs from your hands.”</p><div className="note-source"><span className="note-seal">CDC</span><span><b>Clean hands, healthy people</b><small>Evidence stays attached to the message.</small></span><span className="note-arrow">↗</span></div></div>
          <div className="note-caption"><span className="caption-mark">✳</span><span><b>One message, considered from two sides.</b><br/>The source holds the facts. Context helps with the telling.</span></div>
        </div>
      </section>

      <section id="workflow" className="workspace">
        <div className="section-heading">
          <div><div className="eyebrow small">THE COMMUNICATION WORKBENCH</div><h2>Turn a source into a useful message</h2></div>
          <p>A practical workspace for careful, audience-aware communication.</p>
        </div>
        <div className="work-grid">
          <form className="input-panel panel" onSubmit={(e) => submit(e, 'live')}>
            <div className="panel-top"><div className="step-number">01</div><div><div className="panel-kicker">START WITH THE FACTS</div><h3>Shape your brief</h3></div><Badge>EDUCATIONAL SCENARIO</Badge></div>
            <label className="field-label" htmlFor="claim">What do people need to know?</label>
            <textarea id="claim" rows={3} maxLength={600} value={form.claim} onChange={change('claim')} placeholder="Enter a public-information claim or use the example below." required />
            <div className="field-hint">Try the built-in hand hygiene example. Claims outside its source scope remain unverified.</div>
            <div className="field-row">
              <div className="field-group"><label className="field-label" htmlFor="audience">Intended audience</label><input id="audience" value={form.audience} onChange={change('audience')} maxLength={160} placeholder="e.g. families and volunteers" required /></div>
              <div className="field-group"><label className="field-label" htmlFor="objective">Communication goal</label><select id="objective" value={form.objective} onChange={change('objective')}><option value="remind">A practical reminder</option><option value="clarify">Clarify a confusing claim</option><option value="prepare">Prepare a public notice</option></select></div>
            </div>
            <div className="culture-box">
              <div className="culture-header"><div><div className="panel-kicker">QLOO CULTURAL REFERENCE</div><div className="culture-title">Choose a cultural reference</div></div><span className="q-mark">Q</span></div>
              <p>Qloo needs one public reference (artist, film, podcast, or book) to find related taste signals. It does not identify or represent your audience.</p>
              <div className="field-row culture-fields">
                <div className="field-group"><label className="field-label" htmlFor="seed">Reference</label><input id="seed" value={form.culturalSeed} onChange={change('culturalSeed')} maxLength={100} placeholder="Name an artist, film, podcast…" /></div>
                <div className="field-group field-narrow"><label className="field-label" htmlFor="seedType">Type</label><select id="seedType" value={form.culturalType} onChange={change('culturalType')}><option value="artist">Musician</option><option value="movie">Film</option><option value="podcast">Podcast</option><option value="book">Book</option></select></div>
              </div>
              <div className="culture-foot"><span className="mini-dot coral"/> Signals can inform presentation. They never supply facts or audience assumptions.</div>
            </div>
            <div className="run-actions">
              <button className="primary-button" type="submit" disabled={busy}>{busy ? <><span className="spinner"/> Working through the evidence</> : <>Run live workflow <span aria-hidden="true">↗</span></>}</button>
              <button className="sample-button" type="button" onClick={(e) => submit(e, 'sample')} disabled={busy}>Try clearly labeled sample</button>
            </div>
            {!qlooReady || !geminiReady ? <div className="key-hint" role="status"><span>i</span><div><b>Live run needs your keys.</b><br/>Add <code>QLOO_API_KEY</code> and <code>GEMINI_API_KEY</code> to <code>.env</code>, then restart the server.</div></div> : null}
            <div className="privacy-note"><span>⌑</span> No account. Your brief stays in this browser session.</div>
          </form>

          <section className="results-column" aria-live="polite">
            {!run && !busy && !error ? <div className="empty-state panel">
              <div className="empty-illustration"><div className="empty-ring"><Mark/></div><div className="empty-line line-one"/><div className="empty-line line-two"/><div className="empty-line line-three"/></div>
              <Badge kind="neutral">READY WHEN YOU ARE</Badge><h3>Your evidence trail starts here.</h3><p>Submit a brief to retrieve the CDC source, query Qloo, generate two drafts with Gemini, and review the quality checks.</p>
              <div className="empty-steps"><span><b>1</b> Source</span><span><b>2</b> Signals</span><span><b>3</b> Review</span></div>
            </div> : null}

            {busy ? <div className="running-card panel"><div className="running-head"><div className="spinner large"/><div><Badge kind="neutral">LIVE WORKFLOW</Badge><h3>Gathering the pieces</h3><p>Each step completes from a real source or provider response.</p></div></div><div className="running-list"><span><i/> Retrieve CDC source</span><span><i/> Resolve the cultural reference with Qloo</span><span><i/> Generate and review with Gemini</span></div></div> : null}

            {error ? <div className="error-card panel" role="alert"><div className="error-icon">!</div><div><Badge kind="danger">WORKFLOW NEEDS ATTENTION</Badge><h3>We couldn’t complete this run.</h3><p>{error}</p><div className="error-actions"><button className="secondary-button" onClick={(e) => submit(e, mode)}>Try again</button><button className="text-button" onClick={() => setError('')}>Dismiss</button></div>{run?.trace?.length ? <Trace trace={run.trace}/>: null}</div></div> : null}

            {run?.assessment && !error ? <div className="result-stack">
              <div className="run-banner"><div><Badge kind={run.mode === 'live' ? 'success' : 'warning'}>{run.mode === 'live' ? 'LIVE QLOO + GEMINI' : 'SAMPLE OUTPUT · NOT LIVE'}</Badge><span className="run-time">Run {run.runId.slice(0, 8)} · {new Date(run.completedAt).toLocaleTimeString()}</span></div><button className="icon-button" title="Export review package" aria-label="Download review package" onClick={exportPackage}>↓</button></div>
              <div className="assessment panel"><div className="assessment-icon">✓</div><div><div className="panel-kicker">CLAIM ASSESSMENT</div><h3>{run.assessment.label}</h3><p>{run.assessment.detail}</p></div><a href={run.evidence.url} target="_blank" rel="noreferrer" className="source-link">View source ↗</a></div>

              <div className="evidence-card panel"><div className="card-heading"><div><div className="panel-kicker">EVIDENCE · {run.evidence.publisher.toUpperCase()}</div><h3>{run.evidence.title}</h3></div><span className="source-check">↗</span></div><blockquote>{run.evidence.excerpt}</blockquote><div className="source-meta"><a href={run.evidence.url} target="_blank" rel="noreferrer">cdc.gov/clean-hands <span>↗</span></a><span>Page date: {run.evidence.pageDate}</span><span>Retrieved: {new Date(run.evidence.retrievedAt).toLocaleTimeString()}</span></div></div>

              <div className="qloo-card panel"><div className="qloo-heading"><div className="q-mark large-q">Q</div><div><div className="panel-kicker">CULTURAL INTELLIGENCE</div><h3>{run.culture.source === 'Live Qloo API response' ? 'Qloo added a cultural lens' : 'Illustrative cultural cues'}</h3></div><Badge kind={run.culture.source === 'Live Qloo API response' ? 'success' : 'warning'}>{run.culture.source === 'Live Qloo API response' ? 'LIVE QLOO' : 'SAMPLE ONLY'}</Badge></div>
                {run.culture.resolved ? <div className="resolved-seed">Resolved signal <b>{run.culture.resolved.name}</b><span>{run.culture.resolved.type}</span></div> : <div className="resolved-seed">Example seed <b>{run.culture.seed}</b></div>}
                <div className="signal-list">{run.culture.signals.length ? run.culture.signals.map((x, i) => <span className="signal-chip" key={`${x.name}-${i}`}>{x.name}<small>{x.type}</small></span>) : <span className="muted-copy">Qloo returned no usable tags for this signal. The message remains evidence-led.</span>}</div>
                <p className="limitation"><b>Interpretation limit:</b> {run.culture.limitations}</p>
              </div>

              <div className="drafts-card panel"><div className="draft-heading"><div><div className="panel-kicker">{run.mode === 'live' ? `GEMINI · ${run.model}` : `SAMPLE COPY · ${run.model}`}</div><h3>Two ways to carry the message</h3></div><Badge kind="warning">REVIEW BEFORE USE</Badge></div>
                <div className="draft-pair">
                  <div className="draft-pane"><div className="draft-pane-head"><div><span className="draft-index">A</span><div><b>Baseline</b><small>Verified facts only</small></div></div><button type="button" className="mini-copy" onClick={() => copyDraft('baseline')}>{copied === 'baseline' ? 'Copied' : 'Copy'}</button></div><label className="sr-only" htmlFor="baseline-editor">Edit baseline communication draft</label><textarea id="baseline-editor" className="draft-editor" value={drafts.baseline} onChange={(e) => setDrafts((prev) => ({ ...prev, baseline: e.target.value }))} rows={8} /></div>
                  <div className="draft-pane adapted-pane"><div className="draft-pane-head"><div><span className="draft-index context-index">B</span><div><b>Context-aware</b><small>Facts + Qloo signals</small></div></div><button type="button" className="mini-copy" onClick={() => copyDraft('adapted')}>{copied === 'adapted' ? 'Copied' : 'Copy'}</button></div><label className="sr-only" htmlFor="adapted-editor">Edit culturally informed communication draft</label><textarea id="adapted-editor" className="draft-editor" value={drafts.adapted} onChange={(e) => setDrafts((prev) => ({ ...prev, adapted: e.target.value }))} rows={8} /></div>
                </div>
                <div className="diff-note"><span className="spark">✳</span><span><b>Why the second version differs</b>{run.mode === 'live' ? ' Presentation cues come from the returned Qloo affinity signals. They are optional creative prompts, not audience facts.' : ' This sample version uses fictional example cues; it is not a live Qloo result.'}</span></div>
                <div className="review-notes"><div><span className="panel-kicker">QUALITY REVIEW · {run.drafts.reviewerModel}</span><p>{run.drafts.reviewerNotes}</p></div>{run.drafts.flags.length ? <ul>{run.drafts.flags.map((flag, i) => <li key={i}>{flag}</li>)}</ul> : <span className="no-flags">No automated flags · human approval still required</span>}</div>
                <div className="draft-actions"><span className="editable-label">Both drafts are editable</span><div className="approval-actions"><button className="reject-button" onClick={() => { setApproved(false); setError('Draft rejected. Edit the message or run the workflow again.'); }}>Reject</button><button className={`approve-button ${approved ? 'approved' : ''}`} onClick={() => setApproved((old) => !old)}>{approved ? '✓ Marked reviewed' : 'Mark as reviewed'}</button></div></div>
                {approved ? <div className="approval-note" role="status"><b>Marked as reviewed in this session.</b> This check is only a workflow note; follow your organization’s publication process before sharing.</div> : null}
              </div>

              <Trace trace={run.trace}/>
            </div> : null}
          </section>
        </div>
      </section>

      <section id="about" className="about-section"><div className="about-copy"><div className="eyebrow small">MADE FOR COMMUNITY COMMUNICATORS</div><h2>Keep the facts steady.<br/>Let the message meet people.</h2><p>TrustWeave gives public health teams and community communicators a place to work through a message. Start with a source, consider cultural signals as optional creative context, then edit and review the words before they go anywhere.</p></div><div className="principles"><div><span>01</span><b>Keep the source close</b><p>See the evidence alongside each draft.</p></div><div><span>02</span><b>Culture is context, not proof</b><p>Signals can inform presentation, never stand in for audience research.</p></div><div><span>03</span><b>Leave the decision to people</b><p>Review and edit every draft before sharing.</p></div></div></section>
    </main>
    <footer><div className="footer-brand"><Mark/> trustweave</div><div className="disclaimer">Communication support only. Not medical, emergency, or fact-checking authority.</div><div className="footer-right"><span>Open source · MIT</span><a href="https://qloo.devpost.com/" target="_blank" rel="noreferrer">Qloo Agentic Hackathon ↗</a></div></footer>
  </div>;
}

function Trace({ trace }) {
  if (!trace?.length) return null;
  return <details className="trace-card panel"><summary><span><span className="panel-kicker">ACTIVITY RECORD</span><b>{trace.length} workflow steps</b></span><span className="trace-toggle">＋</span></summary><ol>{trace.map((step, i) => <li key={`${step.name}-${i}`} className={step.status === 'failed' ? 'trace-failed' : ''}><span className="trace-index">{String(i + 1).padStart(2, '0')}</span><div><b>{step.name}</b><p>{step.detail}</p><small>{new Date(step.startedAt).toLocaleTimeString()} {step.completedAt ? `· ${new Date(step.completedAt).toLocaleTimeString()}` : ''}</small></div><Badge kind={step.status === 'complete' ? 'success' : 'danger'}>{step.status}</Badge></li>)}</ol></details>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);


