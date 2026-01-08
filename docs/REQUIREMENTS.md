# Birdmaid Requirements

## Product vision

Birdmaid is an itch.io-at-home for the Omsk gamedev community: a small, hackathon-friendly catalog where teams can publish web builds and players can discover and play them in the browser.

## Roles

- Super Admin: the only authenticated role in FP1; full CRUD access across the system.
- Team member: can edit their team's games and set tags (future; not in FP1 until accounts exist).
- Public Visitor: anonymous browsing and playing of published games only.

## Functional requirements (FR)

- Browse a public catalog of published games.
- View a published game page with details and actions.
- Play the web build in-browser on the game page.
- Super Admin can create and manage Teams, Games, Builds, and Tags (game tags only; no separate tag collection in FP1).
- Super Admin can create a game on behalf of a team (teams can have zero members in FP1).
- Game details include description_md, repo_url, and cover_url (cover_url required to publish).
- Build workflow: upload ZIP -> preview on platform -> publish.
- Publish requires cover_url + description_md + build.
- Game status transitions: editing (default), published, archived.
- Super Admin can move a game from published to editing and leave remarks that must be addressed before republish.
- Tag assignment is restricted to team members and Super Admin (FP1: Super Admin only).
- Support user tags and optional system tags (assigned by Super Admin) for filtering/sorting by hackathons and genres.

## Non-functional requirements (NFR)

- Web builds stored in S3-compatible object storage on a separate machine.
- Max build size 300 MB for MVP; configurable later via Super Admin panel.
- iframe embed with conservative sandboxing; no guarantee for SharedArrayBuffer/WASM threads (COOP/COEP not required).
- Moderation baseline is admin-only takedown with remarks and status changes.
- Compatibility: Godot HTML5 build works if the ZIP contains index.html and assets.

## Stack evaluation (engineering constraints)

- Must be easy for a small community team to maintain.
- Must support iframe play and admin CRUD flows.
- Must have a common ecosystem and testing tooling.
- Minimal ops; deployable to a typical Linux VPS.
- MongoDB and S3-compatible storage must be supported.

## Engineering constraints

- Repo workflow assumes Codex skills are installed under `.codex/skills/**`; contributors must run the install command before agent work.

## UX / Design System (Baseline)

- UI library: MUI (Material UI) + Material 3 baseline.
- Tokens to capture (TBD in design-first): spacing scale (8pt), typography scale, radius, elevation, color palette.
- UX states:
  - Loading states for catalog/game/admin pages (skeleton or spinner).
  - Empty states (no games, no results).
  - Error states with retry for network/API failures.
  - Responsive layout: catalog grid adapts (mobile 1-2 cols, desktop 3-4 cols).
  - Iframe play: clear "Play", "Fullscreen", and fallback message if build fails.
  - Admin publish gating: publish disabled until cover_url + build + description_md present.
- Accessibility baseline:
  - Visible focus, keyboard-navigable primary CTAs, semantic headings.

## Stitch usage (reference-only)

- Stitch is used to generate visual references and design tokens only.
- Stitch exports are not production code; they are references.
- Store Stitch outputs as artifacts (not committed): artifacts/<FP>/<date>/evidence/stitch/*.
- Use English prompts for Stitch.

## Stitch Prompt Pack (Generated)

### Summary

- Product: Birdmaid (Omsk gamedev catalog for web builds)
- FP1 scope: Browse & Play + Admin Authoring
- UI library: MUI (Material 3 baseline)
- Modes: light only (FP1)

### Screens to generate

- CatalogPage: public catalog grid with filters/tags and sort.
- GamePage: game details + play iframe + repo link + markdown description.
- AdminGameEditorPage: game details, build upload, preview, publish, tags, status/remark.
- AdminTeamsPage: create teams (zero members allowed).

### UX requirements to reflect

- Loading/empty/error states for catalog, game page, and admin editor.
- Responsive grid: mobile 1-2 cols, desktop 3-4 cols.
- Clear CTA hierarchy (primary: Play, Publish; secondary: Edit, Preview).
- Publish disabled until cover_url + description_md + build are present.
- Iframe play with fullscreen and fallback message on failure.
- Accessibility: visible focus, keyboard navigable CTAs, semantic headings.

### Design token checklist

- Color palette (primary/secondary/surface/background)
- Typography scale (H1-H6 + body + captions)
- Spacing scale (8pt)
- Radius, elevation, and component density

### Stitch prompt (English)

Design a modern, minimal game catalog and admin authoring UI for a web platform called Birdmaid. Screens: CatalogPage (public catalog grid with filters/tags and sort), GamePage (details with markdown description, repo link, cover, play iframe), AdminGameEditorPage (game details, build upload, preview, publish, tags, status/remark), AdminTeamsPage (create teams, zero members allowed). Emphasize loading/empty/error states, responsive grid (mobile 1-2 cols, desktop 3-4 cols), clear CTA hierarchy (primary: Play, Publish; secondary: Edit, Preview), iframe play with fullscreen and fallback message on failure. Use MUI Material 3 baseline and provide tokens for color palette, typography scale, spacing (8pt), radius, and elevation. Light mode only.

## Non-goals (FP1)

- Self-serve user registration beyond the Super Admin account.
- Automated moderation or community reporting flows.
- Ratings, comments, payments, or marketplace features.
- User management, complex permissions, audit logs, or release history.

## Assumptions

- Team membership management is deferred until after FP1.
- Public catalog only shows published games; editing/archived are hidden.
- Detailed CSP and sandbox rules are defined in discovery and recorded in ADRs.
