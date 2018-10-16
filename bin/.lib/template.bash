#!/bin/bash
########################################
set -euf -o pipefail
source $(dirname "${BASH_SOURCE[0]}")/.lib/include.bash
########################################

require_nonroot

cd $PROJ_DIR


cd $ORIG_DIR

