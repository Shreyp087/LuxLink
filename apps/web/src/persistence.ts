import { canonicalJson, type SigningIdentity, type TransportPacketV1 } from '@luxlink/protocol';

const DATABASE_NAME = 'lightmule-field-store';
const DATABASE_VERSION = 1;

export interface LocalIdentityRecord extends SigningIdentity {
  readonly id: 'local';
  readonly name: string;
  readonly createdAt: number;
  readonly publicKeyEncoded: string;
}

export interface TrustedSource {
  readonly keyId: string;
  readonly name: string;
  readonly publicKeyEncoded: string;
  readonly trustedAt: number;
}

export interface StoredMessage {
  readonly id: string;
  readonly savedAt: number;
  readonly direction: 'originated' | 'received' | 'relayed';
  readonly integrity: 'valid' | 'invalid';
  readonly trustedAtReceipt: boolean;
  readonly packet: TransportPacketV1;
}

export type SaveMessageOutcome = 'stored' | 'extended' | 'replay' | 'custody-conflict';

export interface SaveMessageResult {
  readonly outcome: SaveMessageOutcome;
  readonly record: StoredMessage;
}

type StoreName = 'identity' | 'messages' | 'trusted';
type StoredValue = LocalIdentityRecord | StoredMessage | TrustedSource;

const memory = {
  identity: new Map<IDBValidKey, LocalIdentityRecord>(),
  messages: new Map<IDBValidKey, StoredMessage>(),
  trusted: new Map<IDBValidKey, TrustedSource>(),
};

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction aborted.'));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
  });
}

async function openDatabase(): Promise<IDBDatabase | undefined> {
  if (!('indexedDB' in globalThis)) return undefined;
  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains('identity')) {
      database.createObjectStore('identity', { keyPath: 'id' });
    }
    if (!database.objectStoreNames.contains('messages')) {
      database.createObjectStore('messages', { keyPath: 'id' });
    }
    if (!database.objectStoreNames.contains('trusted')) {
      database.createObjectStore('trusted', { keyPath: 'keyId' });
    }
  };
  return requestResult(request);
}

async function getValue<T extends StoredValue>(
  storeName: StoreName,
  key: IDBValidKey,
): Promise<T | undefined> {
  const database = await openDatabase();
  if (database === undefined) return memory[storeName].get(key) as T | undefined;
  const transaction = database.transaction(storeName, 'readonly');
  const completed = transactionComplete(transaction);
  const result: unknown = await requestResult<unknown>(transaction.objectStore(storeName).get(key));
  await completed;
  database.close();
  return result as T | undefined;
}

async function getValues<T extends StoredValue>(storeName: StoreName): Promise<T[]> {
  const database = await openDatabase();
  if (database === undefined) return [...memory[storeName].values()] as T[];
  const transaction = database.transaction(storeName, 'readonly');
  const completed = transactionComplete(transaction);
  const result: unknown[] = await requestResult<unknown[]>(
    transaction.objectStore(storeName).getAll(),
  );
  await completed;
  database.close();
  return result as T[];
}

async function putValue(storeName: StoreName, value: StoredValue): Promise<void> {
  const database = await openDatabase();
  if (database === undefined) {
    if (storeName === 'identity') {
      const identity = value as LocalIdentityRecord;
      memory.identity.set(identity.id, identity);
    } else if (storeName === 'messages') {
      const message = value as StoredMessage;
      memory.messages.set(message.id, message);
    } else {
      const source = value as TrustedSource;
      memory.trusted.set(source.keyId, source);
    }
    return;
  }
  const transaction = database.transaction(storeName, 'readwrite');
  const completed = transactionComplete(transaction);
  transaction.objectStore(storeName).put(value);
  await completed;
  database.close();
}

function mergeMessage(
  existing: StoredMessage | undefined,
  incoming: StoredMessage,
): SaveMessageResult {
  if (existing === undefined) return { outcome: 'stored', record: incoming };

  const existingHopCount = existing.packet.envelope.hops.length;
  const incomingHopCount = incoming.packet.envelope.hops.length;
  let outcome: SaveMessageOutcome = 'replay';
  let packet = existing.packet;

  if (incomingHopCount > existingHopCount) {
    const incomingPrefix = {
      ...incoming.packet.envelope,
      hops: incoming.packet.envelope.hops.slice(0, existingHopCount),
    };
    if (canonicalJson(existing.packet.envelope) === canonicalJson(incomingPrefix)) {
      outcome = 'extended';
      packet = incoming.packet;
    } else {
      outcome = 'custody-conflict';
    }
  } else {
    const existingPrefix = {
      ...existing.packet.envelope,
      hops: existing.packet.envelope.hops.slice(0, incomingHopCount),
    };
    if (canonicalJson(incoming.packet.envelope) !== canonicalJson(existingPrefix)) {
      outcome = 'custody-conflict';
    }
  }

  return {
    outcome,
    record: {
      ...existing,
      packet,
      trustedAtReceipt: existing.trustedAtReceipt || incoming.trustedAtReceipt,
    },
  };
}

export async function saveMessage(message: StoredMessage): Promise<SaveMessageResult> {
  const database = await openDatabase();
  if (database === undefined) {
    const result = mergeMessage(memory.messages.get(message.id), message);
    memory.messages.set(message.id, result.record);
    return result;
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('messages', 'readwrite');
    const store = transaction.objectStore('messages');
    let result: SaveMessageResult | undefined;
    const request = store.get(message.id);
    request.onsuccess = () => {
      result = mergeMessage(request.result as StoredMessage | undefined, message);
      store.put(result.record);
    };
    transaction.oncomplete = () => {
      database.close();
      if (result === undefined) {
        reject(new Error('IndexedDB message merge did not complete.'));
      } else {
        resolve(result);
      }
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('IndexedDB transaction aborted.'));
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
    };
  });
}

async function deleteValue(storeName: StoreName, key: IDBValidKey): Promise<void> {
  const database = await openDatabase();
  if (database === undefined) {
    memory[storeName].delete(key);
    return;
  }
  const transaction = database.transaction(storeName, 'readwrite');
  const completed = transactionComplete(transaction);
  transaction.objectStore(storeName).delete(key);
  await completed;
  database.close();
}

export const loadIdentity = () => getValue<LocalIdentityRecord>('identity', 'local');
export const saveIdentity = (identity: LocalIdentityRecord) => putValue('identity', identity);
export const listMessages = () => getValues<StoredMessage>('messages');
export const listTrustedSources = () => getValues<TrustedSource>('trusted');
export const saveTrustedSource = (source: TrustedSource) => putValue('trusted', source);
export const removeTrustedSource = (keyId: string) => deleteValue('trusted', keyId);
