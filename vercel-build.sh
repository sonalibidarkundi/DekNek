#!/usr/bin/env bash
set -e

# Ensure npm deps exist if needed
if [ -f package.json ]; then
  npm install --silent || true
fi

# (Optional) nothing else to build; repo is Python + static files.

