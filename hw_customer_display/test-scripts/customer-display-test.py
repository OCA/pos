#! /usr/bin/python
# -*- encoding: utf-8 -*-
# Author : Alexis de Lattre <alexis.delattre@akretion.com>
# The licence is in the file __openerp__.py
# This is a test script, that you can use if you want to test/play
# with the customer display independantly from the Odoo server
# It has been tested with a Bixolon BCD-1100

import sys
import logging

_logger = logging.getLogger(__name__)

try:
    from serial import Serial
    from unidecode import unidecode
except (ImportError, IOError) as err:
    _logger.debug(err)

DEVICE = '/dev/ttyUSB0'
DEVICE_RATE = 9600
DEVICE_COLS = 20


def display_text(ser, line1, line2):
    print "convert to ascii"
    line1 = unidecode(line1)
    line2 = unidecode(line2)
    print "set lines to the right lenght (%s)" % DEVICE_COLS
    for line in [line1, line2]:
        if len(line) < DEVICE_COLS:
            line += ' ' * (DEVICE_COLS - len(line))
        elif len(line) > DEVICE_COLS:
            line = line[0:DEVICE_COLS]
        assert len(line) == DEVICE_COLS, 'Wrong length'
    print "try to clear display"
    ser.write('\x0C')
    print "clear done"
    print "try to position at start of 1st line"
    ser.write('\x1B\x6C' + chr(1) + chr(1))
    print "position done"
    print "try to write 1st line"
    ser.write(line1)
    print "write 1st line done"
    print "try to position at start of 2nd line"
    ser.write('\x1B\x6C' + chr(1) + chr(2))
    print "position done"
    print "try to write 2nd line"
    ser.write(line2)
    print "write done"


def open_close_display(line1, line2):
    ser = False
    try:
        print "open serial port"
        ser = Serial(DEVICE, DEVICE_RATE, timeout=2)
        print "serial port open =", ser.isOpen()
        print "try to set cursor to off"
        ser.write('\x1F\x43\x00')
        print "cursor set to off"
        display_text(ser, line1, line2)
    except Exception, e:
        print "EXCEPTION e=", e
        sys.exit(1)
    finally:
        if ser:
            print "close serial port"
            ser.close()


if __name__ == '__main__':
    line1 = u'POS Code Sprint'
    line2 = u'@ Akretion 2014/07'
    open_close_display(line1, line2)
