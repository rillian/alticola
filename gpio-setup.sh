#!/bin/sh

# set up gpio - run as root

case "$1" in
  start)
    echo "23" > /sys/class/gpio/export
    echo "out" > /sys/class/gpio/gpio23/direction
    ;;
  stop)
    echo "0" > /sys/class/gpio/gpio23/value
    echo 23 > /sys/class/gpio/unexport
    ;;
esac
