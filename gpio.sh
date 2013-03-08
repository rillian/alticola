#!/bin/sh

# setuid script to flip gpio value

PIN=23
DIR=/sys/class/gpio/gpio${PIN}
if ! test -d ${DIR}; then
  echo "gpio ${PIN} not enabled. Please run 'gpio-setup start'"
  exit 1;
fi

case "$1" in
  on)
    echo "1" > ${DIR}/value
    ;;
  off)
    echo "0" > ${DIR}/value
    ;;
  *)
    echo "$0: unrecognized command $1"
    ;;
esac
