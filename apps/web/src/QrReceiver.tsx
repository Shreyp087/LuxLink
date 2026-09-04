import type { IScannerControls } from '@zxing/browser';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

interface QrReceiverProps {
  readonly onFrame: (frame: string) => Promise<void>;
}

const MAX_IMAGE_FILES = 640;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_BATCH_BYTES = 64 * 1024 * 1024;
const MAX_FRAME_PACK_BYTES = 10 * 1024 * 1024;
const MAX_FRAME_PACK_FRAMES = 4096;

export function QrReceiver({ onFrame }: QrReceiverProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('Camera remains off until you explicitly start it.');

  const stopCamera = () => {
    const controls = controlsRef.current;
    if (controls !== null) controls.stop();
    controlsRef.current = null;
    setCameraActive(false);
    setNotice('Camera stopped. Captured frames remain on this device.');
  };

  useEffect(() => stopCamera, []);

  const startCamera = async () => {
    if (videoRef.current === null) return;
    const mediaDevices: unknown = Reflect.get(navigator, 'mediaDevices');
    if (typeof mediaDevices !== 'object' || mediaDevices === null) {
      setNotice('Camera access requires HTTPS or localhost. Use image or frame-pack import here.');
      return;
    }
    try {
      const [{ BrowserQRCodeReader }, { DecodeHintType }] = await Promise.all([
        import('@zxing/browser'),
        import('@zxing/library'),
      ]);
      const reader = new BrowserQRCodeReader(new Map([[DecodeHintType.TRY_HARDER, true]]), {
        delayBetweenScanAttempts: 80,
        delayBetweenScanSuccess: 180,
      });
      controlsRef.current = await reader.decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: 'environment' } } },
        videoRef.current,
        (result) => {
          if (result === undefined) return;
          void onFrame(result.getText()).catch((error: unknown) => {
            setNotice(
              error instanceof Error ? `Frame rejected: ${error.message}` : 'Frame rejected.',
            );
          });
        },
      );
      setCameraActive(true);
      setNotice('Camera active. Hold the full sender code inside the registration marks.');
    } catch (error) {
      setNotice(
        error instanceof Error ? `Camera unavailable: ${error.message}` : 'Camera unavailable.',
      );
    }
  };

  const decodeImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    event.target.value = '';
    if (files.length === 0) return;
    if (files.length > MAX_IMAGE_FILES) {
      setNotice(`Select no more than ${MAX_IMAGE_FILES} QR images at once.`);
      return;
    }
    if (files.some((file) => file.size > MAX_IMAGE_BYTES)) {
      setNotice('Each QR image must be 8 MiB or smaller.');
      return;
    }
    if (files.reduce((total, file) => total + file.size, 0) > MAX_IMAGE_BATCH_BYTES) {
      setNotice('The selected QR image batch must be 64 MiB or smaller.');
      return;
    }
    setBusy(true);
    let decoded = 0;
    try {
      const [{ BrowserQRCodeReader }, { DecodeHintType }] = await Promise.all([
        import('@zxing/browser'),
        import('@zxing/library'),
      ]);
      for (const file of files) {
        const url = URL.createObjectURL(file);
        try {
          // A reader owns mutable decode state. Keep image imports isolated so one difficult symbol
          // cannot contaminate the next file in the batch.
          const reader = new BrowserQRCodeReader(new Map([[DecodeHintType.TRY_HARDER, true]]));
          let decodedText: string;
          try {
            decodedText = (await reader.decodeFromImageUrl(url)).getText();
          } catch {
            // Exported frame PNGs are pure symbols. This fallback bypasses scene detection while the
            // first attempt remains suitable for ordinary photos and screenshots.
            const pureReader = new BrowserQRCodeReader(
              new Map([
                [DecodeHintType.PURE_BARCODE, true],
                [DecodeHintType.TRY_HARDER, true],
              ]),
            );
            decodedText = (await pureReader.decodeFromImageUrl(url)).getText();
          }
          await onFrame(decodedText);
          decoded += 1;
        } catch {
          // Continue through a batch; the summary reports unreadable images.
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      setNotice(
        `Decoded ${decoded} of ${files.length} selected QR image${files.length === 1 ? '' : 's'}.`,
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? `Image decoder unavailable: ${error.message}`
          : 'Image decoder unavailable.',
      );
    } finally {
      setBusy(false);
    }
  };

  const importFramePack = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file === undefined) return;
    if (file.size > MAX_FRAME_PACK_BYTES) {
      setNotice('Frame packs must be 10 MiB or smaller.');
      return;
    }
    setBusy(true);
    try {
      const frames = (await file.text())
        .split(/\r?\n/gu)
        .map((line) => line.trim())
        .filter(Boolean);
      if (frames.length === 0) throw new Error('Frame pack is empty.');
      if (frames.length > MAX_FRAME_PACK_FRAMES) {
        throw new Error(`Frame pack exceeds ${MAX_FRAME_PACK_FRAMES} frames.`);
      }
      for (const frame of frames) await onFrame(frame);
      setNotice(`Imported ${frames.length} optical frame${frames.length === 1 ? '' : 's'}.`);
    } catch (error) {
      setNotice(
        error instanceof Error ? `Frame pack rejected: ${error.message}` : 'Frame pack rejected.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="receiver">
      <div className={`receiver__viewport ${cameraActive ? 'is-active' : ''}`}>
        <video ref={videoRef} muted playsInline aria-label="Live optical receiver camera" />
        {!cameraActive && (
          <div className="receiver__standby" aria-hidden="true">
            <span>CAMERA</span>
            <strong>STANDBY</strong>
          </div>
        )}
        <i className="receiver__bracket receiver__bracket--a" />
        <i className="receiver__bracket receiver__bracket--b" />
        <i className="receiver__bracket receiver__bracket--c" />
        <i className="receiver__bracket receiver__bracket--d" />
      </div>
      <div className="receiver__actions">
        <button
          type="button"
          className="console-action"
          onClick={cameraActive ? stopCamera : startCamera}
        >
          {cameraActive ? 'STOP CAMERA' : 'START CAMERA RECEIVER'}
        </button>
        <label className="file-action">
          <span>{busy ? 'PROCESSING…' : 'IMPORT QR IMAGES'}</span>
          <input type="file" accept="image/*" multiple onChange={decodeImages} disabled={busy} />
        </label>
        <label className="file-action">
          <span>IMPORT FRAME PACK</span>
          <input
            type="file"
            accept=".luxlink,.txt,text/plain"
            onChange={importFramePack}
            disabled={busy}
          />
        </label>
      </div>
      <p className="receiver__notice" role="status">
        {notice}
      </p>
    </div>
  );
}
