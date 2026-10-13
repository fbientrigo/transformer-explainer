#!/usr/bin/env python3
"""Tiny, local decoder-only Transformer for workshop demos.

PyTorch is OPTIONAL and imported only when actually training. No online weights,
hub downloads, HTTP server, or Python dependency in the presentation frontend.
Defaults target an ordinary laptop; GPU use is opt-in via --device auto/cuda.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import random
from pathlib import Path

SCHEMA = "workshop.snapshot.v1"
DEFAULT_CORPUS = (
    "Los modelos de lenguaje aprenden patrones a partir de secuencias. "
    "La atención combina información de tokens anteriores. "
    "Un transformer pequeño puede ilustrar estos conceptos sin requerir grandes recursos. "
    "Los experimentos de ciencia usan medidas, hipótesis y controles. "
) * 10


def arguments(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train a tiny Transformer and export real attention as JSON")
    parser.add_argument("--text", type=Path, help="UTF-8 plain text; otherwise use a small built-in Spanish corpus")
    parser.add_argument("--output", type=Path, default=Path("tiny-lab.snapshot.json"))
    parser.add_argument("--steps", type=int, default=25)
    parser.add_argument("--layers", type=int, default=2)
    parser.add_argument("--heads", type=int, default=4)
    parser.add_argument("--embedding", type=int, default=128)
    parser.add_argument("--context", type=int, default=32)
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--learning-rate", type=float, default=0.003)
    parser.add_argument("--device", choices=("auto", "cpu", "cuda"), default="auto")
    parser.add_argument("--max-vram-mb", type=int, default=3072, help="CUDA allocator cap, NOT a total-system VRAM guarantee")
    parser.add_argument("--prompt", type=str, default=None, help="Must use characters already present in the corpus")
    parser.add_argument("--seed", type=int, default=2026)
    parser.add_argument("--dry-run", action="store_true", help="Inspect config without importing PyTorch")
    result = parser.parse_args(argv)
    if not (0 <= result.steps <= 5000):
        parser.error("steps must be between 0 and 5000")
    if not (1 <= result.layers <= 4 and 1 <= result.heads <= 8):
        parser.error("layers must be 1..4 and heads 1..8")
    if not (32 <= result.embedding <= 192 and result.embedding % result.heads == 0):
        parser.error("embedding must be 32..192 and divisible by heads")
    if not (8 <= result.context <= 64 and 1 <= result.batch_size <= 8):
        parser.error("context must be 8..64 and batch-size 1..8")
    if not (0 < result.learning_rate <= 0.01 and 512 <= result.max_vram_mb <= 3072):
        parser.error("learning-rate or max-vram-mb out of range")
    return result


def load_corpus(path: Path | None) -> tuple[str, list[str], list[int]]:
    if path:
        if path.stat().st_size > 2_000_000:
            raise ValueError("Maximum corpus size: 2 MB; reduce it for a classroom demo")
        text = path.read_text(encoding="utf-8")
    else:
        text = DEFAULT_CORPUS
    alphabet = sorted(set(text))
    if not (2 <= len(alphabet) <= 256):
        raise ValueError("This simple character tokenizer supports 2..256 distinct characters")
    vocab = {char: i for i, char in enumerate(alphabet)}
    return text, alphabet, [vocab[ch] for ch in text]


def count_parameters(vocab: int, embedding: int, layers: int, context: int) -> int:
    # nn.Embedding V*D, positional C*D; per block:
    # 2 layer norms (4D), qkv (3D²+3D), out (D²+D),
    # feedforward (8D²+5D); final layer norm (2D) and head (D*V+V).
    d = embedding
    return vocab * d + context * d + layers * (12 * d * d + 13 * d) + 2 * d + d * vocab + vocab


def main(argv: list[str] | None = None) -> int:
    args = arguments(argv)
    corpus, alphabet, ids = load_corpus(args.text)
    if len(ids) < args.context + 2:
        raise ValueError("Corpus must contain more characters than context + 2")
    parameters_estimate = count_parameters(len(alphabet), args.embedding, args.layers, args.context)
    print(f"Decoder {args.layers} layers × {args.heads} heads, d={args.embedding}, "
          f"context={args.context}, vocab={len(alphabet)}, ~{parameters_estimate:,} params")
    print("Limits: <=4 GB total GPU and <=8 GB system RAM are targets, NOT guaranteed measurements.")
    if args.dry_run:
        print("Dry-run complete; no PyTorch imported, no GPU allocated.")
        return 0

    try:
        import torch
        import torch.nn as nn
        import torch.nn.functional as F
    except ImportError as exc:
        raise SystemExit("Optional dependency missing: install PyTorch locally or use --dry-run") from exc

    torch.manual_seed(args.seed)
    random.seed(args.seed)
    torch.set_num_threads(min(4, max(1, os.cpu_count() or 1)))
    if args.device == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("CUDA requested but torch.cuda.is_available() is false")
    use_cuda = args.device != "cpu" and torch.cuda.is_available()
    if use_cuda:
        available, total = torch.cuda.mem_get_info()
        if available < 1024 * 1024 * 1024:
            if args.device == "cuda":
                raise RuntimeError("Less than 1 GiB GPU memory free; use --device cpu")
            print("Insufficient GPU memory free, using CPU instead.")
            use_cuda = False
        else:
            # Set a per-process allocator limit as an extra defense; CUDA contexts
            # and external allocations can still consume additional GPU memory.
            torch.cuda.set_per_process_memory_fraction(
                min(1.0, args.max_vram_mb * 1024 * 1024 / total), 0
            )
    device = torch.device("cuda:0" if use_cuda else "cpu")
    if use_cuda:
        torch.cuda.reset_peak_memory_stats(device)
    print("Device:", device)

    class Block(nn.Module):
        def __init__(self):
            super().__init__()
            self.ln1 = nn.LayerNorm(args.embedding)
            self.qkv = nn.Linear(args.embedding, 3 * args.embedding)
            self.project = nn.Linear(args.embedding, args.embedding)
            self.ln2 = nn.LayerNorm(args.embedding)
            self.ff = nn.Sequential(
                nn.Linear(args.embedding, 4 * args.embedding),
                nn.GELU(),
                nn.Linear(4 * args.embedding, args.embedding)
            )

        def forward(self, x, inspect=False):
            batch, length, width = x.shape
            q, k, v = self.qkv(self.ln1(x)).chunk(3, dim=-1)
            def split(tensor):
                return tensor.view(batch, length, args.heads, width // args.heads).transpose(1, 2)
            q, k, v = split(q), split(k), split(v)
            scores = (q @ k.transpose(-2, -1)) / math.sqrt(width // args.heads)
            future = torch.triu(torch.ones(length, length, device=x.device, dtype=torch.bool), diagonal=1)
            probabilities = scores.masked_fill(future, float("-inf")).softmax(dim=-1)
            attended = probabilities @ v
            attended = attended.transpose(1, 2).contiguous().view(batch, length, width)
            x = x + self.project(attended)
            x = x + self.ff(self.ln2(x))
            return x, probabilities[0].detach() if inspect else None

    class TinyDecoder(nn.Module):
        def __init__(self):
            super().__init__()
            self.token = nn.Embedding(len(alphabet), args.embedding)
            self.position = nn.Embedding(args.context, args.embedding)
            self.blocks = nn.ModuleList([Block() for _ in range(args.layers)])
            self.final_norm = nn.LayerNorm(args.embedding)
            self.output = nn.Linear(args.embedding, len(alphabet))

        def forward(self, indices, inspect=False):
            batch, length = indices.shape
            positions = torch.arange(length, device=indices.device)
            x = self.token(indices) + self.position(positions)
            attention = []
            for block in self.blocks:
                x, weights = block(x, inspect)
                if inspect:
                    attention.append(weights)
            return self.output(self.final_norm(x)), attention

    model = TinyDecoder().to(device)
    actual_parameters = sum(parameter.numel() for parameter in model.parameters())
    print(f"Actual trainable parameters: {actual_parameters:,}")
    if actual_parameters > 2_000_000:
        raise ValueError("Exceeds the deliberately conservative 2M parameter classroom cap")

    optimizer = torch.optim.AdamW(model.parameters(), lr=args.learning_rate)
    data = torch.tensor(ids, dtype=torch.long)
    history = []
    for step in range(1, args.steps + 1):
        starts = torch.randint(0, len(ids) - args.context - 1, (args.batch_size,))
        x = torch.stack([data[int(i):int(i) + args.context] for i in starts]).to(device)
        targets = torch.stack([data[int(i) + 1:int(i) + args.context + 1] for i in starts]).to(device)
        prediction, _ = model(x)
        loss = F.cross_entropy(prediction.reshape(-1, len(alphabet)), targets.reshape(-1))
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        history.append({"step": step, "loss": round(float(loss.detach().cpu()), 6)})
        if step % 5 == 0 or step == args.steps:
            print(f"step {step}/{args.steps}  loss {history[-1]['loss']:.3f}")

    preview = args.prompt if args.prompt is not None else corpus[:min(args.context, 24)]
    preview = preview[-args.context:]
    vocab = {ch: i for i, ch in enumerate(alphabet)}
    unknown = set(preview).difference(vocab)
    if unknown:
        raise ValueError(f"Prompt contains unseen chars {unknown}; use corpus characters only")
    if not preview:
        raise ValueError("Prompt must not be empty")

    model.eval()
    with torch.no_grad():
        tokens = torch.tensor([[vocab[ch] for ch in preview]], device=device)
        logits, weights = model(tokens, inspect=True)
        last = logits[0, -1].float()
        count = min(16, len(alphabet))
        values, indices = torch.topk(last, k=count)
        candidates = [
            {"token": alphabet[int(i)], "logit": round(float(v), 6)}
            for v, i in zip(values.cpu().tolist(), indices.cpu().tolist())
        ]
        matrices = [
            {"index": layer, "attention": weight.cpu().float().round(decimals=6).tolist()}
            for layer, weight in enumerate(weights)
        ]

    snapshot = {
        "schema": SCHEMA,
        "model": {
            "id": "tiny-decoder-local",
            "architecture": "decoder-transformer",
            "source": "local-pytorch",
            "tokenizer": "character",
            "layers": args.layers,
            "heads": args.heads,
            "embeddingDim": args.embedding,
            "parameterCount": actual_parameters
        },
        "input": {"tokens": list(preview), "tokenIds": [vocab[ch] for ch in preview]},
        "layers": matrices,
        "output": {"candidates": candidates, "selectedToken": alphabet[int(last.argmax())]},
        "training": {"steps": args.steps, "losses": history, "device": str(device)}
    }
    rendered = json.dumps(snapshot, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
    if len(rendered.encode("utf-8")) > 4 * 1024 * 1024:
        raise ValueError("Export too large; reduce --context or layers/heads")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered + "\n", encoding="utf-8")
    print("Exported:", args.output, f"({len(rendered.encode('utf-8')) // 1024} KiB)")
    if use_cuda:
        print(f"PyTorch peak allocated: {torch.cuda.max_memory_allocated(device) / (1024 ** 2):.1f} MiB "
              "(does not include all external CUDA/runtime allocations)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
