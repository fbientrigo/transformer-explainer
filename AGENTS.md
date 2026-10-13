# Development guidance — Transformer Explainer ES

This repository is a fork of [poloclub/transformer-explainer](https://github.com/poloclub/transformer-explainer). Retain upstream MIT license, original attribution, research citations and reproducible examples.

## Product goal
Spanish-first, fast and reliable presentation tool for its presenter (not a student-facing training platform). A conservative local PyTorch tiny-decoder exporter is optional; the browser is only a read-only viewer of versioned, validated, real model snapshots. Do not mistake this for fine-tuning or shrinking the existing GPT-2 visualization.

## Engineering rules
1. Work in feature branches; never push directly to main. Do not open PRs against upstream by default.
2. Keep modules separate: `src/workshop/i18n.ts` for UI translation; `src/workshop/lesson/` for pedagogical sequence; `src/components/workshop/` for presentation shell; `src/workshop/state.ts` for workshop-only UI state. Existing `src/components/`, `src/store/` and `src/utils/` continue owning GPT-2 visualization and computation.
3. Changes should be incremental; do not rewrite D3/Sankey/GSAP or add new heavy UI frameworks for a presentation.
4. Never change precomputed English prompt strings without regenerating *all* corresponding cached inference outputs and their token IDs. Spanish UI is independent of model-token language.
5. Preserve a fast path with cached examples; ONNX weights must load only by explicit user action. Distinguish bandwidth saved per visit from repository/deployment storage.
6. Do not build mock tensors or random attention matrices that are presented as real model activations. Label conceptual/illustrative demos clearly.
7. Later model engines must expose a typed introspection contract; no direct UI dependency on one training framework.
8. Accessibility: keyboard controls, semantic buttons, reduced motion, readable projection typography, and no unnecessary animation. Maintain browser-only/static hosting; avoid server requirements for base slides.
9. Python virtual environments are created per machine using `python tools/setup_venv.py` (stdlib, idempotent, no network), are excluded via `.gitignore`, and must never be committed. PyTorch is allowed **only in tools/tiny_model.py** (opt-in local CLI); never add PyTorch, training services, GPU initialization, or model downloads to browser startup. Aim at 4 GB VRAM / 8 GB RAM and benchmark; do not promise hard hardware limits.
10. Test `npm ci`, `npm run check`, `npm run build`; verify cached examples and model opt-in in a browser. Record what was not run.

11. Integrate any future model through `src/workshop/model/contract.ts`, an explicit versioned snapshot format and `snapshotAdapters.ts`, never by coercing it into GPT-2's fixed 12×12 tensors. Imported JSON is data only; validate size, schema, shapes, finiteness, normalization and causal masking.
12. Do not add remote analytics, web fonts, tracking or new frontend runtime dependencies unless necessary and approved. External GPT-2 inference remains an **optional legacy** path; the presentation and own-model JSON viewer must not require it.

## Where to start
- `docs/workshop-architecture.md` — module boundaries and future model adapter.
- `docs/workshop-roadmap.md` — milestones and acceptance criteria.
- `tools/setup_venv.py` — no-network, cross-platform reproducible local `.venv` setup (Python 3.10+).
- `docs/local-models.md` — implemented optional local tiny Transformer exporter, snapshot contract and hardware budgets.
- `docs/tiny-model-training-vision.md` — additional long-term training features not yet implemented.
- Upstream `README.md` and `LICENSE` remain authoritative for credits.
