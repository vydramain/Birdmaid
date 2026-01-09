# Birdmaid

## Agent workflow quickstart

- Start FP1 discovery: `FP=FP1 mode=discovery — начать`
- Provide ACK by updating `docs/WORKPLAN.yaml` (ack block)
- Artifacts live under `artifacts/<FP>/<date>/`
- Design-first includes Stitch reference generation and token capture (see UX baseline in `docs/REQUIREMENTS.md`).

## Codex Skills

Skills live under `.codex/skills/**` and are opt-in: each role lists required skills and when to run them. If a skill is installed but not referenced by any role, it is considered unused and must be wired in or removed (out of scope to remove now).

| Skill name (folder) | Origin | Purpose | Used by roles |
| --- | --- | --- | --- |
| birdmaid-ux-modern-baseline | project | Enforce UX baseline in docs | design-first |
| fp-bootstrap | project | Bootstrap FP scope artifacts | discovery |
| ux-map-sync | project | Sync UX_MAP with API/MODEL | design-first |
| agentic-code/documentation-criteria | vendor | Doc quality checks | discovery, plan, design-first, tests-red, gate |
| agentic-code/testing-strategy | vendor | Shape UAT/BDD + RTM | tests-red |
| agentic-code/testing | vendor | Testing practices guidance | tests-red, tests-green |
| agentic-code/coding-rules | vendor | Coding rules guardrails | implement |
| agentic-code/implementation-approach | vendor | Implementation approach | implement |
| agentic-code/integration-e2e-testing | vendor | Integration/E2E testing | tests-green |
| agentic-code/ai-development-guide | vendor | General dev guidance | plan, implement |
| agentic-code/metacognition | vendor | Self-check and risk scan | gate |

## Installing / Updating skills

- Prerequisites: Node.js + npx.
- Install vendor skills (agentic-code): `npx agentic-code skills --codex --project`
- Verify install: list `.codex/skills/**` and confirm each skill folder has `SKILL.md`.
- Update/reinstall: rerun the same install command.
- Policy:
  - Vendor skills live under `.codex/skills/vendor/**` (current vendor pack: `.codex/skills/agentic-code`).
  - Project-specific skills live under `.codex/skills/birdmaid-*/SKILL.md`.

## Runbook (scaffolds)

- Frontend install: `cd front && npm install`
- Frontend dev: `cd front && npm run dev`
- Frontend tests: `cd front && npm test`
- Frontend tests (CI): `cd front && npm run test:ci`
- Frontend coverage: `cd front && npm run coverage`
- Backend install: `cd back && npm install`
- Backend dev: `cd back && npm run start:dev`
- Backend tests: `cd back && npm test`
- Backend tests (CI): `cd back && npm run test:ci`
- Backend coverage: `cd back && npm run coverage`

## Docker Compose (local MVP)

- Build and start everything: `docker compose up --build`
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/health`
- MinIO console: `http://localhost:9001` (user/pass: `minioadmin`)

### Local MVP flow

1. **Create a Team**:
   - Go to Admin Teams page (`/admin/teams`)
   - Enter team name and click "Create team"
   - Teams list will be displayed

3. **Create a Game**:
   - Click "Create Game" button on a team card, or navigate to `/admin/games/new`
   - Fill in game details:
     - Team ID (use the team ID from Teams page)
     - Game Title
     - Description (markdown supported)
     - Repository URL
     - Cover URL (required for publishing)
   - Click "Save game" to create the game

4. **Upload Build**:
   - After game is created, use "Build Upload" section
   - Select a ZIP file that contains `index.html` at the root
   - Build will be uploaded and preview will be shown in iframe
   - Build size must not exceed max build size limit (default: 300 MB)

5. **Set Tags** (optional):
   - User tags: comma-separated (e.g., "action, rpg, indie")
   - System tags: comma-separated (e.g., "omsk-hackathon-2024")
   - Click "Save tags"

6. **Publish Game**:
   - Ensure cover URL, description, and build are present
   - Click "Publish" button
   - Game status will change to "published"
   - Published games appear in public catalog

7. **Play Game**:
   - Navigate to catalog (`/`)
   - Click "Open" on any published game
   - Click "Play" button to run the game in iframe

### Navigation

- **Public pages**: Catalog (`/`), Game page (`/games/:gameId`)
- **Admin pages**: Teams (`/admin/teams`), Game Editor (`/admin/games/:gameId` or `/admin/games/new`), Settings (`/admin/settings`)
- Global navigation menu bar provides tabs for all pages: Catalog, Game (when on game page), Teams, Editor, Settings

## Game Upload Process for Godot Web Builds

### Exporting from Godot

1. **Prepare your Godot project**:
   - Ensure your project is ready for export
   - Configure export settings if needed (Project → Project Settings → Export)

2. **Export as HTML5**:
   - Go to **Project → Export**
   - Select **HTML5** as the export platform
   - Click **Export Project**
   - Choose a destination folder and export

3. **Verify export structure**:
   - The exported folder should contain `index.html` at the root
   - Additional files (`.pck`, `.wasm`, `.js`, assets) should be in the same folder
   - Example structure:
     ```
     my-game-export/
     ├── index.html
     ├── my-game.pck
     ├── my-game.wasm
     ├── my-game.js
     └── (other assets)
     ```

### Creating the ZIP file

1. **Zip the exported folder**:
   - Select all files and folders from the exported directory
   - Create a ZIP archive containing these files
   - **Important**: `index.html` must be at the root of the ZIP (not in a subfolder)

2. **Verify ZIP structure**:
   - When you open the ZIP, you should see `index.html` directly (not in a subfolder)
   - Correct structure:
     ```
     build.zip
     ├── index.html
     ├── my-game.pck
     ├── my-game.wasm
     └── ...
     ```
   - Incorrect structure (will fail):
     ```
     build.zip
     └── my-game-export/
         ├── index.html
         └── ...
     ```

### Uploading the build

1. **Navigate to Game Editor**:
   - Go to Teams page and click "Create Game" on a team, or navigate to `/admin/games/new`
   - Fill in game details and click "Save game" to create the game

2. **Upload the ZIP**:
   - In the "Build Upload" section, click the file input
   - Select your ZIP file
   - The build will be uploaded automatically
   - Wait for the upload to complete (progress may not be visible)

3. **Verify upload**:
   - After upload, a preview iframe should appear showing your game
   - If the preview doesn't load, check:
     - ZIP contains `index.html` at root
     - Build size doesn't exceed the limit (default: 300 MB, configurable in Settings)
     - All required files are included in the ZIP

### Format and limitations

- **Format**: ZIP archive containing HTML5 export files
- **Required file**: `index.html` must be at the root of the ZIP
- **Size limit**: Default 300 MB (configurable in Admin Settings)
- **Supported**: Godot HTML5 exports, any web build with `index.html` entry point
- **Storage**: Builds are stored in S3-compatible storage (MinIO in local dev)
- **Access**: Builds are accessed via signed URLs (expire after 1 hour)

### Troubleshooting

- **"ZIP must include index.html at root" error**: Ensure `index.html` is directly in the ZIP root, not in a subfolder
- **Build preview doesn't load**: Check browser console for errors, verify all assets are included in ZIP
- **Upload fails silently**: Check build size limit in Settings, verify ZIP file is not corrupted
- **Game doesn't run after upload**: Ensure all required files (`.pck`, `.wasm`, `.js`, assets) are included in the ZIP

### Test logs and artifacts

- Create artifact folders: `mkdir -p artifacts/FP1/$(date +%F)/{logs,coverage,evidence}`
- Capture front test log: `cd front && npm run test:ci | tee ../artifacts/FP1/$(date +%F)/logs/front-tests.log`
- Capture back test log: `cd back && npm run test:ci | tee ../artifacts/FP1/$(date +%F)/logs/back-tests.log`
- Copy coverage summary:\n  - `cp front/coverage/coverage-summary.json artifacts/FP1/$(date +%F)/coverage/coverage-front.json`\n  - `cp back/coverage/coverage-summary.json artifacts/FP1/$(date +%F)/coverage/coverage-back.json`
