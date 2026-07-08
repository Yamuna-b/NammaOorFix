#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV="${NODE_ENV:-production}"
exec node server/server.js
