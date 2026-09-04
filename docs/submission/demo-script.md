# LuxLink 93-second cinematic demo

The film combines an illustrated simulated scenario with a recording of the real production app.
It needs one computer and no special hardware. The sender and receiver run at separate loopback
origins so they have independent browser storage and identities.

## Storyboard

| Time      | Story beat          | Picture and proof                                                                             |
| --------- | ------------------- | --------------------------------------------------------------------------------------------- |
| 0:00–0:15 | The outage          | Maya's clinic and Arun's shelter remain reachable by foot, but every network path is gone.    |
| 0:15–0:29 | The existing gap    | Conventional messengers assume connectivity; Arun sees that a person can cross the gap.       |
| 0:29–0:41 | The insight         | Sign the message, turn it into visible light, and make the person the network.                |
| 0:41–0:51 | Write and sign      | Maya's browser creates the bounded message and signs its exact bytes locally.                 |
| 0:51–1:01 | Optical handoff     | The sender emits paced QR frames; the second browser receives them without network transport. |
| 1:01–1:10 | Verify honestly     | The receiver rebuilds the bytes and separates signature integrity from human trust.           |
| 1:10–1:18 | Store, carry, relay | Arun's isolated store persists the packet and appends custody without changing the source.    |
| 1:18–1:33 | Resolution          | The shelter can act; LuxLink closes on “When the network stops, the message walks.”           |

The complete spoken copy is in `video-narration.txt`. Captions are burned in so the film remains
understandable when a judge watches muted.

## What is simulated and what is real

- The storm, clinic, shelter, Maya, and Arun are an illustrated scenario, labeled **SIMULATED
  SCENARIO** throughout.
- The write, P-256 signature, QR generation, frame export/import, digest check, signature
  verification, IndexedDB storage, and signed custody hop are performed by the production app.
- `127.0.0.1` and `localhost` provide two isolated browser origins on the same computer. This proves
  separate identities and stores without claiming a physical camera test.
- LuxLink remains an experimental prototype, not an emergency service or a replacement for public
  warning networks.

## Re-recording

1. Build and preview `@luxlink/web` on a loopback address.
2. Run `LUXLINK_DEMO_URL=http://127.0.0.1:4173 node scripts/record-demo.mjs`.
3. The recorder writes a silent 1280 × 720 WebM to the operating-system temporary directory.
4. Add narration and music in post, preserving the 93-second timeline above, and export H.264/AAC
   MP4 with web-optimized metadata.

The repository's final `docs/assets/luxlink-demo.mp4` adds three character performances and an
original ambient score. The four `docs/assets/story-*.png` panels are the authored story art.

## Optional live proof after playback

- Open the sender and receiver in separate profiles or on two devices.
- Display the QR sequence on the sender and select **START CAMERA** on the receiver.
- Turn network emulation off and reload to show the precached shell and persisted inbox.
- Run `pnpm validate` and show the desktop and mobile Playwright journeys.
