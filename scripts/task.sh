#!/bin/bash

CMD=$1
shift

getToolsDir() {
  # If the project was linked together then the .bin executables
  # are not propagated to the top level of the node_modules
  LINKED_PATH=./node_modules/@ibccorp/lib-root-tools/node_modules/.bin
  INSTALLED_PATH=./node_modules/.bin
  if [ -f ${LINKED_PATH}/jest ]; then
      echo ${LINKED_PATH}
  else
      echo ${INSTALLED_PATH}
  fi
}

TOOLS=$(getToolsDir)
echo ${TOOLS}

exe() {
  echo "$@"
  $@;
}

exeIfDir() {
    if [[ -d "$1" ]]; then
      exe "${@:2}"
    fi
}

clean() {
    exe "rm -rf ./dist && rm -rf ./node_modules"
}

build() {
    exeIfDir "./src"  "$TOOLS/babel --config-file $(pwd)/babel.config.js --verbose --copy-files -d ./dist ./src"
    exeIfDir "./src"  "$TOOLS/flow-copy-source -v ./src ./dist"
}

prepublish() {
    build
}

test() {
    exe "yarn jest --clearCache"
    exeIfDir "./__tests__"  "$TOOLS/jest -c $(pwd)/jest.config.js --runInBand --testEnvironment node --rootDir --no-cache --forceExit"
}

lint() {
    exeIfDir "./__tests__"  "$TOOLS/eslint -c $(pwd)/.eslintrc.js --report-unused-disable-directives --fix __tests__"
    exeIfDir "./src"  "$TOOLS/eslint -c $(pwd)/.eslintrc.js --report-unused-disable-directives --fix src"
}

default() {
    if [[ -z "$CMD" ]]; then
      echo "USAGE: ./scripts/task.sh (clean|build|test|lint|<node_modules_bin_command>) command_args"
      exit 0
    fi
    exe ".$TOOLS/$CMD $@"
}

case ${CMD} in
  clean)          clean;;
  build)          build;;
  prepublish)     prepublish;;
  test)           test;;
  lint)           lint;;
  *)              default;;
esac
