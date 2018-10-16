#!/bin/bash

set -euf -o pipefail
ORIG_DIR="$(pwd)"
PROJ_DIR="$(cd "$(dirname "$(dirname "$(dirname "${BASH_SOURCE[0]}")")")" && pwd)"

source "$PROJ_DIR/bin/.lib/common.bash"

