#!/bin/sh

# setuid script to flip gpio value

PIN=23
DIR=/sys/class/gpio/gpio${PIN}

check_dir() {
  if ! test -d ${DIR}; then
    echo "gpio ${PIN} not enabled. Please run '$0 start'"
    exit 1;
  fi
}

case "$1" in
  start)
    echo "23" > /sys/class/gpio/export
    echo "out" > /sys/class/gpio/gpio23/direction
    ;;
  stop)
    echo "0" > /sys/class/gpio/gpio23/value
    echo 23 > /sys/class/gpio/unexport
    ;;
  on)
    check_dir
    echo "1" > ${DIR}/value
    ;;
  off)
    check_dir
    echo "0" > ${DIR}/value
    ;;
  *)
    echo "$0: unrecognized command $1"
    echo "Try $0 [start|stop|on|off]"
    ;;
esac
