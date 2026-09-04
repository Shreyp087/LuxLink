import { useEffect, useMemo, useState } from 'react';

type TransferState = 'ready' | 'acquiring' | 'receiving' | 'verified';

const steps: Array<{ id: TransferState; label: string; detail: string }> = [
  { id: 'ready', label: 'Stand by', detail: 'Optical receiver is staged locally.' },
  { id: 'acquiring', label: 'Find signal', detail: 'Aligning the camera with the sender field.' },
  {
    id: 'receiving',
    label: 'Carry bundle',
    detail: 'Recovering signed symbols without a network.',
  },
  {
    id: 'verified',
    label: 'Trust locally',
    detail: 'Issuer signature and expiry have been checked.',
  },
];

const bundles = [
  { id: 'ATL-046', type: 'EVACUATION', status: 'VERIFIED', age: '00:02', route: 'EOC / A / B' },
  { id: 'ATL-031', type: 'SHELTER', status: 'VERIFIED', age: '04:19', route: 'CLINIC / A' },
  { id: 'CIV-908', type: 'RESOURCE', status: 'UNVERIFIED', age: '12:07', route: 'CIVILIAN' },
];

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M3 3h16v5H8v11H3zm26 0h16v16h-5V8H29zM3 29h5v11h11v5H3zm37 0h5v16H29v-5h11z" />
      <circle cx="24" cy="24" r="4" />
    </svg>
  );
}

function SignalField({ state }: { state: TransferState }) {
  const activeIndex = steps.findIndex((step) => step.id === state);
  return (
    <div className={`signal-field signal-field--${state}`} aria-label={`Transfer state: ${state}`}>
      <div className="signal-field__grid" aria-hidden="true" />
      <div className="signal-field__reticle" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="signal-field__core" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <b />
      </div>
      <div className="signal-field__readout">
        <span>LINK / {String(activeIndex + 1).padStart(2, '0')}</span>
        <strong>{state === 'verified' ? 'SIGNATURE VALID' : 'OPTICAL FIELD'}</strong>
      </div>
    </div>
  );
}

function App() {
  const [state, setState] = useState<TransferState>('ready');
  const [mode, setMode] = useState<'receive' | 'carry' | 'relay'>('receive');
  const [clock, setClock] = useState(() => new Date());
  const activeIndex = steps.findIndex((step) => step.id === state);
  const currentStep = steps[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (state === 'ready' || state === 'verified') return;
    const next: Record<Exclude<TransferState, 'ready' | 'verified'>, TransferState> = {
      acquiring: 'receiving',
      receiving: 'verified',
    };
    const timer = window.setTimeout(
      () => setState(next[state]),
      state === 'acquiring' ? 1_500 : 2_400,
    );
    return () => window.clearTimeout(timer);
  }, [state]);

  const timeLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(clock),
    [clock],
  );

  const beginTransfer = () => {
    setMode('receive');
    setState('acquiring');
  };

  return (
    <main className="shell">
      <a className="skip-link" href="#operation">
        Skip to operation
      </a>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="LightMule home">
          <BrandMark />
          <span className="brand__name">LIGHTMULE</span>
          <span className="brand__tag">FIELD RELAY / 01</span>
        </a>
        <div className="topbar__status" aria-label="System status">
          <span className="status-dot" />
          <span>READY WITHOUT NETWORK</span>
          <span className="topbar__divider">/</span>
          <time dateTime={clock.toISOString()}>{timeLabel}</time>
        </div>
      </header>

      <aside className="side-index" aria-label="Page index">
        <span>LM//FIELD</span>
        <span>SIM / 33.7490 N</span>
        <span>SIM / 84.3880 W</span>
        <span className="side-index__line" />
        <span>NO NETWORK</span>
      </aside>

      <section className="hero" id="top">
        <div className="hero__copy">
          <p className="eyebrow">
            <span>PROTOCOL STUDY 01</span> / HUMAN-CARRIED NETWORKS
          </p>
          <h1>
            When the network stops, <em>the message walks.</em>
          </h1>
          <p className="hero__lede">
            Small, signed emergency bundles move from screen to camera, survive offline, and travel
            with the people already moving through the outage.
          </p>
          <div className="hero__actions">
            <button className="button button--primary" type="button" onClick={beginTransfer}>
              <span>Run field test</span>
              <span aria-hidden="true">↗</span>
            </button>
            <a className="button button--text" href="#operation">
              Inspect protocol <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <SignalField state={state} />
        <div className="hero__specs" aria-label="System constraints">
          <span>
            <b>2 FPS</b> safe optical mode
          </span>
          <span>
            <b>P-256</b> issuer signature
          </span>
          <span>
            <b>NO RF</b> transport after setup
          </span>
        </div>
      </section>

      <div className="marquee" aria-label="System principles">
        <div>
          <span>SIGNED AT SOURCE</span>
          <i>◆</i>
          <span>CARRIED BY PEOPLE</span>
          <i>◆</i>
          <span>SOURCE SIGNATURE SURVIVES EVERY HOP</span>
          <i>◆</i>
          <span>VISIBLE LIGHT / SMALL DATA</span>
          <i>◆</i>
          <span aria-hidden="true">SIGNED AT SOURCE</span>
          <i aria-hidden="true">◆</i>
          <span aria-hidden="true">CARRIED BY PEOPLE</span>
        </div>
      </div>

      <section className="operation" id="operation">
        <div className="section-heading">
          <span className="section-heading__number">01</span>
          <div>
            <p className="eyebrow">LIVE OPERATING MODEL</p>
            <h2>One bundle. Three human states.</h2>
          </div>
          <p className="section-heading__note">The carrier changes. The authority does not.</p>
        </div>

        <div className="mode-selector" role="tablist" aria-label="Relay modes">
          {(['receive', 'carry', 'relay'] as const).map((item, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={mode === item}
              className={mode === item ? 'is-active' : ''}
              onClick={() => setMode(item)}
              key={item}
            >
              <span>0{index + 1}</span>
              <strong>{item}</strong>
              <small>
                {item === 'receive'
                  ? 'screen → phone'
                  : item === 'carry'
                    ? 'store → move'
                    : 'phone → phone'}
              </small>
            </button>
          ))}
        </div>

        <div className="operation-grid">
          <article className="bundle-card">
            <div className="bundle-card__flag">PRIORITY / LIFE SAFETY</div>
            <div className="bundle-card__topline">
              <span>INCIDENT ATL-046</span>
              <span className="trust-label">
                <i /> VERIFIED ISSUER
              </span>
            </div>
            <h3>
              North corridor closed.
              <br />
              Use stairwell C.
            </h3>
            <p>
              Issued by Campus Emergency Operations. Valid until 19:45 local. Carry this update to
              the south shelter.
            </p>
            <dl>
              <div>
                <dt>MESSAGE ID</dt>
                <dd>9F2C…A781</dd>
              </div>
              <div>
                <dt>AGE</dt>
                <dd>00:02:14</dd>
              </div>
              <div>
                <dt>HOPS</dt>
                <dd>02 / 08</dd>
              </div>
              <div>
                <dt>SIZE</dt>
                <dd>384 B</dd>
              </div>
            </dl>
            <div className="bundle-card__signature">
              <span>SIGNATURE</span>
              <code>30 44 02 20 51 B7 8F D2 … 9C</code>
              <strong>VALID</strong>
            </div>
          </article>

          <article className="transfer-console">
            <p className="sr-only" role="status">
              {currentStep.label}. {currentStep.detail}
            </p>
            <div className="transfer-console__header">
              <span>FIELD TEST / LOCAL ONLY</span>
              <button type="button" onClick={() => setState('ready')}>
                RESET
              </button>
            </div>
            <ol>
              {steps.map((step, index) => (
                <li className={index <= activeIndex ? 'is-reached' : ''} key={step.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{step.label}</strong>
                    <p>{step.detail}</p>
                  </div>
                  <i
                    aria-label={
                      index < activeIndex || state === 'verified'
                        ? 'complete'
                        : index === activeIndex
                          ? 'current'
                          : 'pending'
                    }
                  />
                </li>
              ))}
            </ol>
            <button
              className="console-action"
              type="button"
              onClick={beginTransfer}
              disabled={state === 'acquiring' || state === 'receiving'}
            >
              {state === 'verified'
                ? 'RUN AGAIN'
                : state === 'ready'
                  ? 'BEGIN OPTICAL HANDOFF'
                  : 'RECEIVING SYMBOLS…'}
            </button>
            <p className="console-note">
              Simulation only. Camera and optical codec arrive in the protocol milestone.
            </p>
          </article>
        </div>
      </section>

      <section className="inbox">
        <div className="section-heading section-heading--compact">
          <span className="section-heading__number">02</span>
          <div>
            <p className="eyebrow">LOCAL BUNDLE INDEX</p>
            <h2>What this device can carry.</h2>
          </div>
        </div>
        <div className="inbox-table" role="table" aria-label="Stored emergency bundles">
          <div className="inbox-table__head" role="row">
            <span>IDENTIFIER</span>
            <span>TYPE</span>
            <span>TRUST</span>
            <span>AGE</span>
            <span>RELAY PATH</span>
          </div>
          {bundles.map((bundle) => (
            <div className="inbox-table__row" role="row" key={bundle.id}>
              <strong>{bundle.id}</strong>
              <span>{bundle.type}</span>
              <span className={bundle.status === 'VERIFIED' ? 'is-verified' : 'is-unverified'}>
                {bundle.status}
              </span>
              <span>{bundle.age}</span>
              <span>{bundle.route}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="principle">
        <p className="eyebrow">DESIGN POSITION</p>
        <p className="principle__statement">
          Not a replacement for emergency networks. <em>One more path when they disappear.</em>
        </p>
        <div className="principle__grid">
          <span>PRELOADED</span>
          <span>LINE OF SIGHT</span>
          <span>SMALL PAYLOADS</span>
          <span>PUBLIC BY DEFAULT</span>
        </div>
      </section>

      <footer>
        <div className="brand">
          <BrandMark />
          <span className="brand__name">LIGHTMULE</span>
        </div>
        <p>
          Experimental public-safety communications study.
          <br />
          No FEMA, FCC, or 911 affiliation.
        </p>
        <p className="footer__build">
          LUXLINK REPOSITORY
          <br />
          BUILD 0001 / 2026
        </p>
      </footer>
    </main>
  );
}

export default App;
