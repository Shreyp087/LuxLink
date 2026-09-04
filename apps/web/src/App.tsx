import {
  bundleId,
  deriveKeyId,
  exportPublicKey,
  generateSigningIdentity,
  importPublicKey,
  type MessageKind,
  type Need,
  type Priority,
  type TransportPacketV1,
  type VerificationResult,
} from '@luxlink/protocol';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  createOriginTransmission,
  createRelayTransmission,
  fingerprint,
  OpticalCollector,
  prepareTransmission,
  type CollectionProgress,
  type Transmission,
} from './field';
import {
  listMessages,
  listTrustedSources,
  loadIdentity,
  removeTrustedSource,
  saveIdentity,
  saveMessage,
  saveTrustedSource,
  type LocalIdentityRecord,
  type StoredMessage,
  type SaveMessageOutcome,
  type TrustedSource,
} from './persistence';
import { QrReceiver } from './QrReceiver';
import { QrTransmitter } from './QrTransmitter';

type Workspace = 'compose' | 'transmit' | 'receive' | 'inbox' | 'identity';

interface Receipt {
  readonly packet: TransportPacketV1;
  readonly verification: VerificationResult;
  readonly trusted: boolean;
}

interface ContactCard {
  readonly version: 'lightmule.contact.v1';
  readonly name: string;
  readonly keyId: string;
  readonly publicKey: string;
}

const workspaces: ReadonlyArray<{ id: Workspace; label: string; detail: string }> = [
  { id: 'compose', label: 'Write', detail: 'author → sign' },
  { id: 'transmit', label: 'Show', detail: 'screen → camera' },
  { id: 'receive', label: 'Scan', detail: 'capture → verify' },
  { id: 'inbox', label: 'Carry', detail: 'store → relay' },
  { id: 'identity', label: 'Trust', detail: 'keys → contacts' },
];

const needs: readonly Need[] = [
  'evacuation',
  'food',
  'medical',
  'rescue',
  'shelter',
  'transport',
  'water',
];
const messageKinds: readonly Exclude<MessageKind, 'ack'>[] = [
  'sos',
  'hazard',
  'resource',
  'status',
];
let identityInitialization: Promise<LocalIdentityRecord> | undefined;

async function createLocalIdentity(): Promise<LocalIdentityRecord> {
  const generated = await generateSigningIdentity();
  return Object.freeze({
    ...generated,
    id: 'local',
    name: 'This field device',
    createdAt: Date.now(),
    publicKeyEncoded: await exportPublicKey(generated.publicKey),
  });
}

function ensureIdentity(): Promise<LocalIdentityRecord> {
  identityInitialization ??= (async () => {
    const existing = await loadIdentity();
    if (existing !== undefined) return existing;
    const created = await createLocalIdentity();
    await saveIdentity(created);
    return created;
  })();
  return identityInitialization;
}

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M3 3h16v5H8v11H3zm26 0h16v16h-5V8H29zM3 29h5v11h11v5H3zm37 0h5v16H29v-5h11z" />
      <circle cx="24" cy="24" r="4" />
    </svg>
  );
}

function SignalField({
  ready,
  active,
  verified,
}: {
  ready: boolean;
  active: boolean;
  verified: boolean;
}) {
  const state = verified ? 'verified' : active ? 'receiving' : ready ? 'ready' : 'acquiring';
  return (
    <div className={`signal-field signal-field--${state}`} aria-label={`Field system: ${state}`}>
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
        <span>CORE / {ready ? 'ONLINE' : 'BOOT'}</span>
        <strong>{verified ? 'SIGNATURE VALID' : active ? 'OPTICAL SIGNAL' : 'LOCAL READY'}</strong>
      </div>
    </div>
  );
}

function downloadText(filename: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.download = filename;
  anchor.href = url;
  anchor.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [workspace, setWorkspace] = useState<Workspace>('compose');
  const [identity, setIdentity] = useState<LocalIdentityRecord>();
  const [trusted, setTrusted] = useState<TrustedSource[]>([]);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [transmission, setTransmission] = useState<Transmission>();
  const [receipt, setReceipt] = useState<Receipt>();
  const [progress, setProgress] = useState<CollectionProgress>();
  const [systemNotice, setSystemNotice] = useState('Initializing local cryptographic identity…');
  const [clock, setClock] = useState(() => new Date());
  const [incidentId, setIncidentId] = useState('FIELD-DEMO-01');
  const [messageText, setMessageText] = useState('North corridor closed. Use stairwell C.');
  const [priority, setPriority] = useState<Priority>('critical');
  const [kind, setKind] = useState<Exclude<MessageKind, 'ack'>>('hazard');
  const [lifetime, setLifetime] = useState(60);
  const [maxHops, setMaxHops] = useState(8);
  const [peopleCount, setPeopleCount] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState<Need[]>([]);
  const [working, setWorking] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [trustConfirmation, setTrustConfirmation] = useState('');
  const collector = useRef(new OpticalCollector());
  const acceptingFrame = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let mounted = true;
    void navigator.serviceWorker.ready.then(() => {
      if (mounted) setOfflineReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const localIdentity = await ensureIdentity();
        const ownTrust: TrustedSource = {
          keyId: localIdentity.keyId,
          name: localIdentity.name,
          publicKeyEncoded: localIdentity.publicKeyEncoded,
          trustedAt: localIdentity.createdAt,
        };
        await saveTrustedSource(ownTrust);
        const [storedMessages, storedTrusted] = await Promise.all([
          listMessages(),
          listTrustedSources(),
        ]);
        setIdentity(localIdentity);
        setMessages(storedMessages.sort((a, b) => b.savedAt - a.savedAt));
        setTrusted(storedTrusted);
        setSystemNotice(
          'indexedDB' in globalThis
            ? 'Local identity and offline store ready.'
            : 'Local identity ready; persistent browser storage unavailable.',
        );
      } catch (error) {
        setSystemNotice(error instanceof Error ? error.message : 'Initialization failed.');
      }
    })();
  }, []);

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

  const storeMessage = async (
    packet: TransportPacketV1,
    direction: StoredMessage['direction'],
    isTrusted: boolean,
  ): Promise<SaveMessageOutcome> => {
    const id = await bundleId(packet.envelope.signedBundle.bundle);
    const record: StoredMessage = {
      id,
      savedAt: Date.now(),
      direction,
      integrity: 'valid',
      trustedAtReceipt: isTrusted,
      packet,
    };
    const result = await saveMessage(record);
    setMessages((current) => [result.record, ...current.filter((item) => item.id !== record.id)]);
    return result.outcome;
  };

  const composeMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (identity === undefined) return;
    setWorking(true);
    setSystemNotice('Signing locally and preparing optical frames…');
    try {
      const prepared = await createOriginTransmission(
        {
          incidentId,
          priority,
          kind,
          text: messageText,
          lifetimeMinutes: lifetime,
          maxHops,
          ...(peopleCount === '' ? {} : { peopleCount: Number(peopleCount) }),
          ...(selectedNeeds.length === 0 ? {} : { needs: selectedNeeds }),
        },
        identity,
      );
      setTransmission(prepared);
      await storeMessage(prepared.packet, 'originated', true);
      setWorkspace('transmit');
      setSystemNotice(
        `${prepared.frames.length} optical frames ready. Message signed only on this device.`,
      );
    } catch (error) {
      setSystemNotice(error instanceof Error ? error.message : 'Could not prepare the message.');
    } finally {
      setWorking(false);
    }
  };

  const acceptFrame = async (encoded: string) => {
    if (acceptingFrame.current) return;
    acceptingFrame.current = true;
    try {
      const next = await collector.current.accept(encoded);
      setProgress(next);
      if (next.replay) {
        setSystemNotice('Repeated transfer ignored. Existing custody history was preserved.');
        return;
      }
      if (next.duplicate && next.packet === undefined) {
        setSystemNotice(
          `Duplicate frame ignored. ${next.received} of ${next.total} unique frames retained.`,
        );
      }
      if (next.packet === undefined || next.verification === undefined) return;
      const sourceId = next.packet.envelope.signedBundle.signature.keyId;
      const isTrusted = trusted.some((source) => source.keyId === sourceId);
      setTrustConfirmation('');
      setReceipt({ packet: next.packet, verification: next.verification, trusted: isTrusted });
      if (next.verification.valid) {
        const outcome = await storeMessage(next.packet, 'received', isTrusted);
        if (outcome === 'replay') {
          setSystemNotice('Known bundle ignored. Existing custody history was preserved.');
        } else if (outcome === 'custody-conflict') {
          setSystemNotice('Valid alternate custody branch detected; the existing branch was kept.');
        } else {
          setSystemNotice(
            isTrusted
              ? 'Bundle verified from a trusted source.'
              : 'Signature valid; source fingerprint is not yet trusted.',
          );
        }
      } else {
        setSystemNotice(`Bundle rejected: ${next.verification.error ?? 'verification failed'}`);
      }
    } catch (error) {
      const failure = error instanceof Error ? error : new Error('Frame rejected.');
      setSystemNotice(failure.message);
      throw failure;
    } finally {
      acceptingFrame.current = false;
    }
  };

  const resetReceiver = () => {
    collector.current.reset();
    setProgress(undefined);
    setReceipt(undefined);
    setTrustConfirmation('');
    setSystemNotice('Receiver cleared and ready for a new transfer.');
  };

  const loopbackTest = async () => {
    if (transmission === undefined) return;
    resetReceiver();
    setWorkspace('receive');
    setWorking(true);
    try {
      for (const frame of transmission.frames) await acceptFrame(frame);
    } catch {
      // acceptFrame has already published a precise failure.
    } finally {
      setWorking(false);
    }
  };

  const downloadFramePack = () => {
    if (transmission === undefined) return;
    downloadText(
      `lightmule-${transmission.bundleId.slice(0, 10)}.luxlink`,
      `${transmission.frames.join('\n')}\n`,
      'application/x-luxlink',
    );
  };

  const trustReceiptSource = async () => {
    if (receipt === undefined || !receipt.verification.valid) return;
    const keyId = receipt.packet.envelope.signedBundle.signature.keyId;
    if (trustConfirmation.trim() !== keyId.slice(-6)) {
      setSystemNotice(
        'Compare the source out of band, then enter the final six fingerprint characters.',
      );
      return;
    }
    const source: TrustedSource = {
      keyId,
      name: `Field source ${fingerprint(keyId).split(' · ')[0]}`,
      publicKeyEncoded: receipt.packet.publicKeys[keyId],
      trustedAt: Date.now(),
    };
    await saveTrustedSource(source);
    setTrusted((current) => [source, ...current.filter((item) => item.keyId !== keyId)]);
    setReceipt({ ...receipt, trusted: true });
    setTrustConfirmation('');
    await storeMessage(receipt.packet, 'received', true);
    setSystemNotice('Source fingerprint added to this device’s trusted contacts.');
  };

  const showStoredMessage = async (message: StoredMessage, relay: boolean) => {
    if (identity === undefined) return;
    setWorking(true);
    try {
      const prepared = relay
        ? await createRelayTransmission(message.packet, identity)
        : await prepareTransmission(message.packet);
      setTransmission(prepared);
      if (relay) await storeMessage(prepared.packet, 'relayed', message.trustedAtReceipt);
      setWorkspace('transmit');
      setSystemNotice(
        relay
          ? 'Relay hop signed and appended. New optical signal ready.'
          : 'Stored bundle prepared for optical display.',
      );
    } catch (error) {
      setSystemNotice(error instanceof Error ? error.message : 'Unable to prepare stored bundle.');
    } finally {
      setWorking(false);
    }
  };

  const exportContact = () => {
    if (identity === undefined) return;
    const contact: ContactCard = {
      version: 'lightmule.contact.v1',
      name: identity.name,
      keyId: identity.keyId,
      publicKey: identity.publicKeyEncoded,
    };
    downloadText(
      `lightmule-contact-${identity.keyId.slice(0, 8)}.json`,
      JSON.stringify(contact, null, 2),
      'application/json',
    );
  };

  const importContact = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file === undefined) return;
    if (file.size > 8 * 1024) {
      setSystemNotice('Contact cards must be 8 KiB or smaller.');
      return;
    }
    try {
      const candidate: unknown = JSON.parse(await file.text());
      if (candidate === null || typeof candidate !== 'object') {
        throw new Error('Invalid contact card.');
      }
      const contactKeys = Object.keys(candidate).sort().join(',');
      if (contactKeys !== 'keyId,name,publicKey,version') {
        throw new Error('Contact card contains missing or unknown fields.');
      }
      const card = candidate as Partial<ContactCard>;
      if (
        card.version !== 'lightmule.contact.v1' ||
        typeof card.name !== 'string' ||
        typeof card.keyId !== 'string' ||
        typeof card.publicKey !== 'string'
      ) {
        throw new Error('Invalid contact card fields.');
      }
      const nameBytes = new TextEncoder().encode(card.name).byteLength;
      if (nameBytes < 1 || nameBytes > 80) throw new Error('Contact name must be 1-80 bytes.');
      const imported = await importPublicKey(card.publicKey);
      if ((await deriveKeyId(imported)) !== card.keyId) {
        throw new Error('Contact fingerprint does not match its public key.');
      }
      const source: TrustedSource = {
        keyId: card.keyId,
        name: card.name.slice(0, 80),
        publicKeyEncoded: card.publicKey,
        trustedAt: Date.now(),
      };
      await saveTrustedSource(source);
      setTrusted((current) => [source, ...current.filter((item) => item.keyId !== source.keyId)]);
      setSystemNotice(`Trusted contact imported: ${source.name}.`);
    } catch (error) {
      setSystemNotice(error instanceof Error ? error.message : 'Contact import failed.');
    }
  };

  const rotateIdentity = async () => {
    if (
      !window.confirm(
        'Rotate this device identity? Existing messages remain readable, but new messages use a new fingerprint.',
      )
    ) {
      return;
    }
    const created = await createLocalIdentity();
    await saveIdentity(created);
    identityInitialization = Promise.resolve(created);
    setIdentity(created);
    const source: TrustedSource = {
      keyId: created.keyId,
      name: created.name,
      publicKeyEncoded: created.publicKeyEncoded,
      trustedAt: created.createdAt,
    };
    await saveTrustedSource(source);
    setTrusted((current) => [source, ...current]);
    setSystemNotice('Device identity rotated. Share the new public contact card out of band.');
  };

  const textBytes = new TextEncoder().encode(messageText).byteLength;
  const sourceId = receipt?.packet.envelope.signedBundle.signature.keyId;
  const trustCode = sourceId?.slice(-6);

  return (
    <main className="shell">
      <a className="skip-link" href="#field-console">
        Skip to field console
      </a>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="LightMule home">
          <BrandMark />
          <span className="brand__name">LIGHTMULE</span>
          <span className="brand__tag">FIELD RELAY / 01</span>
        </a>
        <div className="topbar__status" aria-label="System status">
          <span className="status-dot" />
          <span>
            {identity === undefined
              ? 'INITIALIZING'
              : offlineReady && 'indexedDB' in globalThis
                ? 'OFFLINE CORE READY'
                : 'LOCAL CORE READY · PRELOAD PENDING'}
          </span>
          <span className="topbar__divider">/</span>
          <time dateTime={clock.toISOString()}>{timeLabel}</time>
        </div>
      </header>

      <aside className="side-index" aria-label="Page index">
        <span>LM//FIELD</span>
        <span>LOCAL CRYPTO</span>
        <span>QR / ES256</span>
        <span className="side-index__line" />
        <span>NO NETWORK</span>
      </aside>

      <section className="hero" id="top">
        <div className="hero__copy">
          <p className="eyebrow">
            <span>WORKING FIELD BUILD</span> / HUMAN-CARRIED NETWORKS
          </p>
          <h1>
            When the network stops, <em>the message walks.</em>
          </h1>
          <p className="hero__lede">
            After one preload, create a signed emergency bundle, move it through animated QR frames,
            verify every byte locally, then carry it onward without a server.
          </p>
          <div className="hero__actions">
            <button
              className="button button--primary"
              type="button"
              onClick={() => {
                setWorkspace('compose');
                document.querySelector('#field-console')?.scrollIntoView();
              }}
            >
              <span>Open field system</span>
              <span aria-hidden="true">↗</span>
            </button>
            <a className="button button--text" href="#field-console">
              Inspect workflow <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <SignalField
          ready={identity !== undefined}
          active={transmission !== undefined}
          verified={Boolean(receipt?.verification.valid)}
        />
        <div className="hero__specs" aria-label="System constraints">
          <span>
            <b>2 FPS</b> paced QR signal
          </span>
          <span>
            <b>P-256</b> origin + relay signatures
          </span>
          <span>
            <b>0 API</b> data stays local
          </span>
        </div>
      </section>

      <div className="marquee" aria-label="System principles">
        <div>
          <span>SIGNED AT SOURCE</span>
          <i>◆</i>
          <span>CARRIED BY PEOPLE</span>
          <i>◆</i>
          <span>TRUST IS EXPLICIT</span>
          <i>◆</i>
          <span>VISIBLE LIGHT / SMALL DATA</span>
        </div>
      </div>

      <section className="field-system" id="field-console">
        <div className="section-heading">
          <span className="section-heading__number">01</span>
          <div>
            <p className="eyebrow">OPERATIONAL SOFTWARE</p>
            <h2>The complete local circuit.</h2>
          </div>
          <p className="section-heading__note">
            First load requires distribution. After that, no account, cloud API, Bluetooth pairing,
            or network is used during a transfer.
          </p>
        </div>

        <div className="system-strip">
          <span className="status-dot" />
          <strong>FIELD STATUS</strong>
          <p role="status">{systemNotice}</p>
          <span>{messages.length} STORED</span>
        </div>
        <div className="workspace-tabs" role="tablist" aria-label="Field workflow">
          {workspaces.map((item, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={workspace === item.id}
              className={workspace === item.id ? 'is-active' : ''}
              onClick={() => setWorkspace(item.id)}
              key={item.id}
            >
              <span>0{index + 1}</span>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </button>
          ))}
        </div>

        <div className="workspace-panel">
          {workspace === 'compose' && (
            <form className="compose-grid" onSubmit={composeMessage}>
              <div className="compose-grid__message">
                <label>
                  <span>INCIDENT IDENTIFIER</span>
                  <input
                    required
                    maxLength={64}
                    pattern="[A-Za-z0-9][A-Za-z0-9._:-]*"
                    value={incidentId}
                    onChange={(event) => setIncidentId(event.target.value)}
                  />
                </label>
                <label>
                  <span>MESSAGE / 160 BYTES MAX</span>
                  <textarea
                    required
                    rows={5}
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                  />
                  <small className={textBytes > 160 ? 'is-error' : ''}>
                    {textBytes} / 160 BYTES
                  </small>
                </label>
              </div>
              <fieldset>
                <legend>CLASSIFICATION</legend>
                <label>
                  <span>PRIORITY</span>
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as Priority)}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <label>
                  <span>MESSAGE TYPE</span>
                  <select
                    value={kind}
                    onChange={(event) => setKind(event.target.value as Exclude<MessageKind, 'ack'>)}
                  >
                    {messageKinds.map((value) => (
                      <option value={value} key={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>VALID FOR</span>
                  <select
                    value={lifetime}
                    onChange={(event) => setLifetime(Number(event.target.value))}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={360}>6 hours</option>
                    <option value={1440}>24 hours</option>
                  </select>
                </label>
                <label>
                  <span>MAXIMUM HOPS</span>
                  <input
                    type="number"
                    min={0}
                    max={16}
                    value={maxHops}
                    onChange={(event) => setMaxHops(Number(event.target.value))}
                  />
                </label>
                <label>
                  <span>PEOPLE AFFECTED</span>
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    placeholder="Optional"
                    value={peopleCount}
                    onChange={(event) => setPeopleCount(event.target.value)}
                  />
                </label>
              </fieldset>
              <fieldset className="need-fieldset">
                <legend>NEEDS / OPTIONAL</legend>
                <div className="need-grid">
                  {needs.map((need) => (
                    <label key={need}>
                      <input
                        type="checkbox"
                        checked={selectedNeeds.includes(need)}
                        onChange={(event) =>
                          setSelectedNeeds((current) =>
                            event.target.checked
                              ? [...current, need].sort()
                              : current.filter((item) => item !== need),
                          )
                        }
                      />
                      <span>{need}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="compose-grid__commit">
                <div>
                  <span>SIGNING IDENTITY</span>
                  <strong>
                    {identity === undefined ? 'GENERATING…' : fingerprint(identity.keyId)}
                  </strong>
                  <small>Private key never leaves this browser profile.</small>
                </div>
                <button
                  className="console-action"
                  type="submit"
                  disabled={identity === undefined || working || textBytes > 160}
                >
                  {working ? 'SIGNING…' : 'SIGN & PREPARE SIGNAL'}
                </button>
              </div>
            </form>
          )}

          {workspace === 'transmit' &&
            (transmission === undefined ? (
              <div className="empty-state">
                <span>NO ACTIVE SIGNAL</span>
                <h3>Write and sign a message first.</h3>
                <button type="button" onClick={() => setWorkspace('compose')}>
                  OPEN COMPOSER
                </button>
              </div>
            ) : (
              <div className="transmit-grid">
                <QrTransmitter
                  frames={transmission.frames}
                  label={transmission.bundleId.slice(0, 10)}
                />
                <aside className="transmit-ledger">
                  <p className="eyebrow">ACTIVE TRANSMISSION</p>
                  <h3>{transmission.packet.envelope.signedBundle.bundle.text}</h3>
                  <dl>
                    <div>
                      <dt>BUNDLE</dt>
                      <dd>{fingerprint(transmission.bundleId)}</dd>
                    </div>
                    <div>
                      <dt>FRAMES</dt>
                      <dd>{transmission.frames.length}</dd>
                    </div>
                    <div>
                      <dt>HOPS</dt>
                      <dd>
                        {transmission.packet.envelope.hops.length} /{' '}
                        {transmission.packet.envelope.signedBundle.bundle.maxHops}
                      </dd>
                    </div>
                    <div>
                      <dt>EXPIRES</dt>
                      <dd>
                        {new Date(
                          transmission.packet.envelope.signedBundle.bundle.expiresAt,
                        ).toLocaleTimeString()}
                      </dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    className="ledger-action"
                    onClick={loopbackTest}
                    disabled={working}
                  >
                    VERIFY ON THIS DEVICE
                  </button>
                  <button type="button" className="ledger-action" onClick={downloadFramePack}>
                    DOWNLOAD FRAME PACK
                  </button>
                  <p>
                    The loopback test uses the same frame decoder, hash check, packet parser, and
                    signature verification as a camera transfer.
                  </p>
                </aside>
              </div>
            ))}

          {workspace === 'receive' && (
            <div className="receive-grid">
              <QrReceiver onFrame={acceptFrame} />
              <aside className="receive-ledger">
                <div className="receive-ledger__head">
                  <p className="eyebrow">REASSEMBLY LEDGER</p>
                  <button type="button" onClick={resetReceiver}>
                    RESET
                  </button>
                </div>
                <div className="progress-meter">
                  <span
                    style={{
                      width: `${progress === undefined ? 0 : (progress.received / progress.total) * 100}%`,
                    }}
                  />
                </div>
                <strong className="progress-label">
                  {progress === undefined
                    ? 'WAITING FOR FRAME 01'
                    : `${progress.received} / ${progress.total} UNIQUE FRAMES`}
                </strong>
                {receipt !== undefined && (
                  <div
                    className={`receipt ${receipt.verification.valid ? 'is-valid' : 'is-invalid'}`}
                  >
                    <span>
                      {receipt.verification.valid
                        ? 'CRYPTOGRAPHIC INTEGRITY VALID'
                        : 'BUNDLE REJECTED'}
                    </span>
                    <h3>{receipt.packet.envelope.signedBundle.bundle.text}</h3>
                    <p>SOURCE / {sourceId === undefined ? 'UNKNOWN' : fingerprint(sourceId)}</p>
                    <strong>{receipt.trusted ? 'TRUSTED SOURCE' : 'SOURCE NOT YET TRUSTED'}</strong>
                    {receipt.verification.valid && !receipt.trusted && sourceId !== undefined && (
                      <div className="trust-confirmation">
                        <p>Compare this full fingerprint through a separate trusted channel:</p>
                        <code>{sourceId}</code>
                        <label>
                          ENTER FINAL 6 / {trustCode}
                          <input
                            value={trustConfirmation}
                            maxLength={6}
                            autoComplete="off"
                            spellCheck={false}
                            onChange={(event) => setTrustConfirmation(event.target.value.trim())}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={trustReceiptSource}
                          disabled={trustConfirmation.trim() !== trustCode}
                        >
                          TRUST VERIFIED FINGERPRINT
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <p className="trust-warning">
                  A valid signature proves the bundle was not altered. Trust requires comparing the
                  source fingerprint through a separate channel.
                </p>
              </aside>
            </div>
          )}

          {workspace === 'inbox' && (
            <div className="stored-list">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <span>OFFLINE INBOX EMPTY</span>
                  <h3>Received and originated bundles appear here.</h3>
                </div>
              ) : (
                messages.map((message) => {
                  const bundle = message.packet.envelope.signedBundle.bundle;
                  const messageSourceId = message.packet.envelope.signedBundle.signature.keyId;
                  const currentlyTrusted = trusted.some(
                    (source) => source.keyId === messageSourceId,
                  );
                  return (
                    <article key={message.id}>
                      <div className="stored-list__status">
                        <span>{message.direction}</span>
                        <strong className={currentlyTrusted ? 'is-verified' : 'is-unverified'}>
                          {currentlyTrusted ? 'TRUSTED NOW' : 'SOURCE NOT CURRENTLY TRUSTED'}
                        </strong>
                      </div>
                      <h3>{bundle.text}</h3>
                      <dl>
                        <div>
                          <dt>INCIDENT</dt>
                          <dd>{bundle.incidentId}</dd>
                        </div>
                        <div>
                          <dt>PRIORITY</dt>
                          <dd>{bundle.priority}</dd>
                        </div>
                        <div>
                          <dt>HOPS</dt>
                          <dd>{message.packet.envelope.hops.length}</dd>
                        </div>
                        <div>
                          <dt>SAVED</dt>
                          <dd>{new Date(message.savedAt).toLocaleString()}</dd>
                        </div>
                      </dl>
                      <div className="stored-list__actions">
                        <button type="button" onClick={() => showStoredMessage(message, false)}>
                          SHOW AGAIN
                        </button>
                        <button
                          type="button"
                          onClick={() => showStoredMessage(message, true)}
                          disabled={
                            working || message.packet.envelope.hops.length >= bundle.maxHops
                          }
                        >
                          SIGN + RELAY
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {workspace === 'identity' && (
            <div className="identity-grid">
              <article className="identity-card">
                <p className="eyebrow">THIS DEVICE</p>
                <span className="identity-card__seal">
                  <BrandMark />
                </span>
                <h3>{identity?.name ?? 'Generating identity…'}</h3>
                <code>{identity === undefined ? '—' : fingerprint(identity.keyId)}</code>
                <p>
                  ES256 / P-256 · generated locally · non-exportable private key stored in this
                  browser’s IndexedDB.
                </p>
                <button type="button" onClick={exportContact} disabled={identity === undefined}>
                  EXPORT PUBLIC CONTACT
                </button>
                <button type="button" className="is-danger" onClick={rotateIdentity}>
                  ROTATE DEVICE IDENTITY
                </button>
              </article>
              <section className="contact-ledger">
                <div>
                  <p className="eyebrow">TRUSTED CONTACTS</p>
                  <label className="file-action">
                    <span>IMPORT CONTACT CARD</span>
                    <input type="file" accept="application/json,.json" onChange={importContact} />
                  </label>
                </div>
                {trusted.map((source) => (
                  <article key={source.keyId}>
                    <div>
                      <strong>{source.name}</strong>
                      <code>{fingerprint(source.keyId)}</code>
                    </div>
                    <span>{new Date(source.trustedAt).toLocaleDateString()}</span>
                    {source.keyId !== identity?.keyId && (
                      <button
                        type="button"
                        onClick={async () => {
                          await removeTrustedSource(source.keyId);
                          setTrusted((current) =>
                            current.filter((item) => item.keyId !== source.keyId),
                          );
                          setReceipt((current) =>
                            current?.packet.envelope.signedBundle.signature.keyId === source.keyId
                              ? { ...current, trusted: false }
                              : current,
                          );
                        }}
                      >
                        REMOVE
                      </button>
                    )}
                  </article>
                ))}
              </section>
            </div>
          )}
        </div>
      </section>

      <section className="proof-strip">
        <div>
          <span>01</span>
          <strong>AUTHOR</strong>
          <p>Small, time-bounded emergency message.</p>
        </div>
        <div>
          <span>02</span>
          <strong>SIGN</strong>
          <p>P-256 origin signature generated locally.</p>
        </div>
        <div>
          <span>03</span>
          <strong>SHOW</strong>
          <p>Checksummed QR frames cross an air gap.</p>
        </div>
        <div>
          <span>04</span>
          <strong>CARRY</strong>
          <p>Verified bundle persists and gains signed hops.</p>
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
          Experimental public-safety communications software.
          <br />
          No FEMA, FCC, or 911 affiliation.
        </p>
        <p className="footer__build">
          LUXLINK PROTOCOL
          <br />
          FIELD BUILD 0002 / 2026
        </p>
      </footer>
    </main>
  );
}

export default App;
