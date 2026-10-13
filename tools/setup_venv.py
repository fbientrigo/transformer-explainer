#!/usr/bin/env python3
"""Create or verify the repository-local Python environment without network access.

The venv is deliberately not tracked in Git; it is recreated on each machine.
Training dependencies (PyTorch/CUDA) must be installed explicitly by the user.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import subprocess
import sys
import venv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
VENV_DIR = PROJECT_ROOT / ".venv"
VENV_PYTHON = (
    VENV_DIR / "Scripts" / "python.exe"
    if os.name == "nt"
    else VENV_DIR / "bin" / "python"
)


def verify() -> bool:
    """Check that the local interpreter and pip belong to this specific venv."""
    if not (VENV_DIR / "pyvenv.cfg").is_file() or not VENV_PYTHON.is_file():
        return False

    script = (
        "import pathlib, sys; "
        "actual = pathlib.Path(sys.prefix).resolve(); "
        "expected = pathlib.Path(sys.argv[1]).resolve(); "
        "sys.exit(0 if actual == expected and sys.prefix != sys.base_prefix else 1)"
    )
    try:
        owned = subprocess.run(
            [str(VENV_PYTHON), "-c", script, str(VENV_DIR)],
            check=False, capture_output=True, text=True
        )
        if owned.returncode:
            return False
        pip_check = subprocess.run(
            [str(VENV_PYTHON), "-m", "pip", "--version"],
            check=False, capture_output=True, text=True
        )
        return pip_check.returncode == 0
    except OSError:
        return False


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Bootstrap an isolated .venv using Python's standard library"
    )
    parser.add_argument(
        "--check", action="store_true",
        help="Verify .venv exists and has a working Python and pip; do not create it"
    )
    args = parser.parse_args(argv)

    if sys.version_info < (3, 10):
        parser.error("Python 3.10 or newer is required")

    if args.check:
        if not verify():
            print("Invalid or missing .venv. Run: python tools/setup_venv.py", file=sys.stderr)
            return 1
    elif VENV_DIR.exists():
        if not verify():
            print(
                "Existing .venv is invalid or was moved. Remove .venv explicitly, "
                "then rerun this command.",
                file=sys.stderr
            )
            return 1
        print("Existing .venv is valid; nothing to install.")
    else:
        print("Creating an isolated .venv (Python standard library only)...")
        try:
            venv.EnvBuilder(with_pip=True, system_site_packages=False).create(VENV_DIR)
        except (OSError, subprocess.CalledProcessError) as error:
            print(
                f"Failed to create .venv: {error}. On Debian/Ubuntu, install "
                "the python3-venv system package and try again.",
                file=sys.stderr
            )
            return 1
        if not verify():
            print("The newly created .venv failed verification.", file=sys.stderr)
            return 1

    print(f"Virtual environment ready: {VENV_DIR}")
    print(f"Python: {VENV_PYTHON}")
    print("No network access and no third-party packages required.")
    if os.name == "nt":
        print(r"PowerShell: .\\.venv\\Scripts\\Activate.ps1")
        print(r"Or directly: .\\.venv\\Scripts\\python.exe tools\\tiny_model.py --dry-run")
    else:
        print("Shell: source .venv/bin/activate")
        print("Or directly: .venv/bin/python tools/tiny_model.py --dry-run")
    print("PyTorch is optional. Install the correct CPU/CUDA wheel into .venv")
    print("only when you plan to train a model (see docs/local-models.md).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
