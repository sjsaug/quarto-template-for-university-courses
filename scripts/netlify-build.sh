#!/usr/bin/env bash
set -euo pipefail

# Ensure we have Quarto available (Netlify build images do not include it by default).
if ! command -v quarto >/dev/null 2>&1; then
  QUARTO_VERSION="${QUARTO_VERSION:-1.4.550}"
  echo "Installing Quarto ${QUARTO_VERSION}..."
  WORKDIR="$(mktemp -d)"
  curl -fsSL "https://github.com/quarto-dev/quarto-cli/releases/download/v${QUARTO_VERSION}/quarto-${QUARTO_VERSION}-linux-amd64.tar.gz" -o "${WORKDIR}/quarto.tgz"
  tar -xzf "${WORKDIR}/quarto.tgz" -C "${WORKDIR}"
  export PATH="${WORKDIR}/quarto-${QUARTO_VERSION}/bin:${PATH}"
else
  echo "Using preinstalled Quarto: $(quarto --version)"
fi

quarto render
