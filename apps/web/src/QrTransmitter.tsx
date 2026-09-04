import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { OPTICAL_FRAME_RATE } from './field';

interface QrTransmitterProps {
  readonly frames: readonly string[];
  readonly label: string;
}

export function QrTransmitter({ frames, label }: QrTransmitterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [renderedFrame, setRenderedFrame] = useState(-1);
  const [renderError, setRenderError] = useState('');
  const safeIndex = frames.length === 0 ? 0 : frameIndex % frames.length;

  useEffect(() => {
    if (frames.length === 0) return;
    const canvas = canvasRef.current;
    if (canvas === null) return;
    let current = true;
    setRenderError('');
    void QRCode.toCanvas(canvas, frames[safeIndex], {
      errorCorrectionLevel: 'M',
      margin: 4,
      width: 768,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(() => {
        if (current) setRenderedFrame(safeIndex);
      })
      .catch((error: unknown) => {
        if (current) {
          setRenderError(error instanceof Error ? error.message : 'QR rendering failed.');
        }
      });
    return () => {
      current = false;
    };
  }, [frames, safeIndex]);

  useEffect(() => {
    setFrameIndex(0);
  }, [frames]);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const timer = window.setInterval(
      () => setFrameIndex((current) => (current + 1) % frames.length),
      1_000 / OPTICAL_FRAME_RATE,
    );
    return () => window.clearInterval(timer);
  }, [frames.length, playing]);

  const downloadFrame = () => {
    const canvas = canvasRef.current;
    if (canvas === null || renderedFrame !== safeIndex) return;
    const anchor = document.createElement('a');
    anchor.download = `${label}-frame-${String(safeIndex + 1).padStart(3, '0')}.png`;
    anchor.href = canvas.toDataURL('image/png');
    anchor.click();
  };

  if (frames.length === 0) return null;

  return (
    <div className="optical-transmitter">
      <div className="optical-transmitter__screen">
        <canvas
          ref={canvasRef}
          aria-label={`Optical QR frame ${safeIndex + 1} of ${frames.length}`}
          data-rendered-frame={renderedFrame === safeIndex ? safeIndex + 1 : undefined}
        />
        <span className="optical-transmitter__corner optical-transmitter__corner--a" />
        <span className="optical-transmitter__corner optical-transmitter__corner--b" />
        <span className="optical-transmitter__corner optical-transmitter__corner--c" />
        <span className="optical-transmitter__corner optical-transmitter__corner--d" />
      </div>
      <div className="optical-transmitter__readout" aria-live="polite">
        <strong>
          FRAME {String(safeIndex + 1).padStart(2, '0')} / {String(frames.length).padStart(2, '0')}
        </strong>
        <span>{OPTICAL_FRAME_RATE} FPS · CRC32 · ES256</span>
      </div>
      {renderError !== '' && <p className="optical-transmitter__error">{renderError}</p>}
      <div className="transmitter-controls">
        <button
          type="button"
          onClick={() => setFrameIndex((safeIndex - 1 + frames.length) % frames.length)}
        >
          PREV
        </button>
        <button type="button" className="is-primary" onClick={() => setPlaying((value) => !value)}>
          {playing ? 'PAUSE SIGNAL' : 'PLAY SIGNAL'}
        </button>
        <button type="button" onClick={() => setFrameIndex((safeIndex + 1) % frames.length)}>
          NEXT
        </button>
        <button type="button" onClick={downloadFrame} disabled={renderedFrame !== safeIndex}>
          SAVE PNG
        </button>
      </div>
    </div>
  );
}
