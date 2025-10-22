# AGENTS.md

## Purpose
- Provide lightweight onboarding for AI or automation agents working on the Temme Cloud & Tech GmbH landing page repository.
- Capture the conventions, workflows, and guardrails that keep the website consistent and maintainable.

## Project Snapshot
- Stack: [Hugo](https://gohugo.io/) static site generator with the `hello-friend-ng` theme.
- Production URL: `https://temme.cloud/` (default German, English translation available).
- Primary configuration: `hugo.toml`.
- Content root: `content/<lang>/` (currently `de` & `en`); shared assets: `static/`; generated output: `public/`.
- Theme overrides live under `layouts/`; page bundles reside in `pages/` if needed.

## Day-to-Day Tasks
- **Local preview**: run `hugo server` from the repo root; the site serves at `http://localhost:1313`.
- **Build for deployment**: run `hugo`; artifacts write to `public/`.
- **Adding content**: create/edit Markdown under the relevant language folder in `content/<lang>/`. Keep `translationKey` consistent across locales and respect existing front matter fields (title, description, draft, etc.).
- **Translating pages**: duplicate the file into the other language folder, reuse the same `translationKey`, and update menu metadata so both locales appear in navigation.
- **Updating navigation or footer**: adjust `[menu]` and localized `[params.<lang>.footer.*]` blocks in `hugo.toml`.
- **Static assets**: drop images, fonts, or downloadable files in `static/` to expose them at the site root.

## Content & Copy Guidelines
- Primary language is German (`de-DE`). Maintain tone: professional, clear, and concise.
- Use Markdown for body copy; prefer relative links within the site.
- When adding metadata (SEO descriptions, keywords), keep them short (<160 chars) and aligned with the page topic.
- Check for legal links (Impressum, Datenschutz) when editing footer or global navigation.

## Code & Structure Guidelines
- Favor Hugo shortcodes or partials over duplicating markup.
- Place reusable layout changes in `layouts/` rather than editing theme files inside `themes/`.
- Keep custom SCSS/CSS centralized; avoid inline styles beyond quick experiments.
- Respect existing configuration comments in `hugo.toml`; document new sections briefly.

## Testing & Verification
- After changes, run `hugo` to confirm the site builds without warnings.
- Spot-check the generated pages in `hugo server` to verify links, formatting, and language.
- For accessibility-sensitive updates, manually verify contrast and semantics where practical.

## Operational Notes
- The `public/` directory is generated—do not edit contents directly. Clean builds regenerate it.
- Repository license: MIT (see `LICENSE`).
- Coordinating with humans: mention context, affected paths, and any manual steps required for deployment when handing off work.

## Useful References
- Hugo docs: https://gohugo.io/documentation/
- hello-friend-ng theme: https://github.com/rhazdon/hugo-theme-hello-friend-ng

Keep this document updated as tooling, workflows, or conventions evolve.
