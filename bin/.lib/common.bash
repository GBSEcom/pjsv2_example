#!/bin/bash

set -euf -o pipefail
ORIG_DIR="$(pwd)"
PROJ_DIR="$(cd "$(dirname "$(dirname "$(dirname "${BASH_SOURCE[0]}")")")" && pwd)"

function fn_exists()
{
  type $1 2>/dev/null | grep -q 'function'
}

function errormsg()
{
  echo >&2 "$1"
  exit 1
}

function require_nonroot()
{
  if [[ $UID = 0 ]]; then
    errormsg "Please don't run as root!  Aborting!"
  fi
}

function require_num_args()
{
  actual=$1
  expected=$2
  if [ $actual -ne $expected ]; then
    if [ $# -gt 2 ]; then
      err=$3
    else
      err="required number of args: $expected"
    fi
    errormsg "$err"
  fi
}

function echo_header()
{
  echo ""
  echo "------------------------------------------------"
  echo "$1"
  echo "------------------------------------------------"
}

function echo_footer()
{
  echo "---------------------DONE-----------------------"
  echo ""
}

function list_missing()
{
  NEEDLE="$1"
  shift
  HAYSTACK="$@"
  for item in $HAYSTACK; do
    if [[ "$item" == "$NEEDLE" ]]; then
      return 1
    fi
  done
  return 0
}

