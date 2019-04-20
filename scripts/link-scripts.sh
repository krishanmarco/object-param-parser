#!/bin/bash

# Define all constants below
DIRS=(libs apps helm)

CMD=$1
shift

REPO=$@

exe() {
  echo "$@"
  $@;
}

applyEachSubdir() {
  for d in $2/*; do
      if [[ -d "${d}" ]]; then
        $1 ${d}
      fi
  done
}

link() {
  _link() { cp -rf ./scripts ${1}/scripts; }
  for x in "${DIRS[@]}"; do
    applyEachSubdir _link ${x}
  done

  # Clean
  rm -rf scripts/scripts || true
}

ulink() {
  _unlink() { rm -rf ${1}/scripts; }
  for x in "${DIRS[@]}"; do
    applyEachSubdir _unlink ${x}
  done
}

case ${CMD} in
  link)     link;;
  ulink)    ulink ;;
esac
