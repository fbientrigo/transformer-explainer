# Development guidance — Transformer Explainer ES

This repository is a fork of [poloclub/transformer-explainer](https://github.com/poloclub/transformer-explainer). Retain upstream MIT license, original attribution, research citations and reproducible examples.

## Product goal
Spanish-first, fast educational visualization for non-programmers and classroom projection. Future goal: students train a genuinely small Transformer and inspect **its own** internals. Do not mistake this goal for fine-tuning or shrinking the existing GPT-2 visualization.

## Engineering rules
1. Work in feature branches; never push directly to main. Do not open PRs against upstream by default.
2. Keep modules separate: `src/workshop/i18n.ts` for UI translation; `src/workshop/lesson/` for pedagogical sequence; `src/components/workshop/` for presentation shell; `src/workshop/state.ts` for workshop-only UI state. Existing `src/components/`, `src/store/` and `src/utils/` continue owning GPT-2 visualization and computation.
3. Changes should be incremental; do not rewrite D3/Sankey/GSAP or add new heavy UI frameworks for a presentation.
4. Never change precomputed English prompt strings without regenerating *all* corresponding cached inference outputs and their token IDs. Spanish UI is independent of model-token language.
5. Preserve a fast path with cached examples; ONNX weights must load only by explicit user action. Distinguish bandwidth saved per visit from repository/deployment storage.
6. Do not build mock tensors or random attention matrices that are presented as real model activations. Label conceptual/illustrative demos clearly.
7. Later model engines must expose a typed introspection contract; no direct UI dependency on one training framework.
8. Accessibility: keyboard controls, semantic buttons, reduced motion, readable projection typography, and no unnecessary animation. Maintain browser-only/static hosting; avoid server requirements for base slides.
9. Do not introduce Colab, PyTorch, training jobs or large model downloads into default app startup. Training is a long-term optional lab module.
10. Test `npm ci`, `npm run check`, `npm run build`; verify cached examples and model opt-in in a browser. Record what was not run.

## Where to start
- `docs/workshop-architecture.md` — module boundaries and future model adapter.
- `docs/workshop-roadmap.md` — milestones and acceptance criteria.
- `docs/tiny-model-training-vision.md` — deferred training laboratory.
- Upstream `README.md` and `LICENSE` remain authoritative for credits.
