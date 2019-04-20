#!/bin/sh
find \
    -name 'node_modules' -o \
    -name 'build' -o \
    -name 'dist' -o \
    -name 'yarn-error.log' -o \
| xargs rm -rf;
echo "Done";
