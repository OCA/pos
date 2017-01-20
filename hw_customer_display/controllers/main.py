# -*- encoding: utf-8 -*-
##############################################################################
#
#    Hardware Customer Display module for Odoo
#    Copyright (C) 2014 Akretion (http://www.akretion.com)
#    @author Alexis de Lattre <alexis.delattre@akretion.com>
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################


import logging
import simplejson
import time
from threading import Thread, Lock
from Queue import Queue
import openerp.addons.hw_proxy.controllers.main as hw_proxy
from openerp import http
from openerp.tools.config import config

logger = logging.getLogger(__name__)

try:
    from serial import Serial
    from unidecode import unidecode
except (ImportError, IOError) as err:
    logger.debug(err)


class CustomerDisplayDriver(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.queue = Queue()
        self.lock = Lock()
        self.status = {'status': 'connecting', 'messages': []}
        self.device_name = config.get(
            'customer_display_device_name', '/dev/ttyUSB0')
        self.device_rate = int(config.get(
            'customer_display_device_rate', 9600))
        self.device_timeout = int(config.get(
            'customer_display_device_timeout', 2))
        self.serial = False

    def get_status(self):
        self.push_task('status')
        return self.status

    def set_status(self, status, message=None):
        if status == self.status['status']:
            if message is not None and message != self.status['messages'][-1]:
                self.status['messages'].append(message)
        else:
            self.status['status'] = status
            if message:
                self.status['messages'] = [message]
            else:
                self.status['messages'] = []

        if status == 'error' and message:
            logger.error('Display Error: '+message)
        elif status == 'disconnected' and message:
            logger.warning('Disconnected Display: '+message)

    def lockedstart(self):
        with self.lock:
            if not self.isAlive():
                self.daemon = True
                self.start()

    def push_task(self, task, data=None):
        self.lockedstart()
        self.queue.put((time.time(), task, data))

    def move_cursor(self, col, row):
        # Bixolon spec : 11. "Move Cursor to Specified Position"
        self.cmd_serial_write('\x1B\x6C' + chr(col) + chr(row))

    def display_text(self, lines):
        logger.debug(
            "Preparing to send the following lines to LCD: %s" % lines)
        # We don't check the number of rows/cols here, because it has already
        # been checked in the POS client in the JS code
        lines_ascii = []
        for line in lines:
            lines_ascii.append(unidecode(line))
        row = 0
        for dline in lines_ascii:
            row += 1
            self.move_cursor(1, row)
            self.serial_write(dline)

    def setup_customer_display(self):
        '''Set LCD cursor to off
        If your LCD has different setup instruction(s), you should
        inherit this function'''
        # Bixolon spec : 35. "Set Cursor On/Off"
        self.cmd_serial_write('\x1F\x43\x00')
        logger.debug('LCD cursor set to off')

    def clear_customer_display(self):
        '''If your LCD has different clearing instruction, you should inherit
        this function'''
        # Bixolon spec : 12. "Clear Display Screen and Clear String Mode"
        self.cmd_serial_write('\x0C')
        logger.debug('Customer display cleared')

    def cmd_serial_write(self, command):
        '''If your LCD requires a prefix and/or suffix on all commands,
        you should inherit this function'''
        assert isinstance(command, str), 'command must be a string'
        self.serial_write(command)

    def serial_write(self, text):
        assert isinstance(text, str), 'text must be a string'
        self.serial.write(text)

    def send_text_customer_display(self, text_to_display):
        '''This function sends the data to the serial/usb port.
        We open and close the serial connection on every message display.
        Why ?
        1. Because it is not a problem for the customer display
        2. Because it is not a problem for performance, according to my tests
        3. Because it allows recovery on errors : you can unplug/replug the
        customer display and it will work again on the next message without
        problem
        '''
        lines = simplejson.loads(text_to_display)
        assert isinstance(lines, list), 'lines_list should be a list'
        try:
            logger.debug(
                'Opening serial port %s for customer display with baudrate %d'
                % (self.device_name, self.device_rate))
            self.serial = Serial(
                self.device_name, self.device_rate,
                timeout=self.device_timeout)
            logger.debug('serial.is_open = %s' % self.serial.isOpen())
            self.setup_customer_display()
            self.clear_customer_display()
            self.display_text(lines)
        except Exception, e:
            logger.error('Exception in serial connection: %s' % str(e))
        finally:
            if self.serial:
                logger.debug('Closing serial port for customer display')
                self.serial.close()

    def run(self):
        while True:
            try:
                timestamp, task, data = self.queue.get(True)
                if task == 'display':
                    self.send_text_customer_display(data)
                elif task == 'status':
                    pass
            except Exception as e:
                self.set_status('error', str(e))


driver = CustomerDisplayDriver()

hw_proxy.drivers['customer_display'] = driver


class CustomerDisplayProxy(hw_proxy.Proxy):
    @http.route(
        '/hw_proxy/send_text_customer_display', type='json', auth='none',
        cors='*')
    def send_text_customer_display(self, text_to_display):
        logger.debug(
            'LCD: Call send_text_customer_display with text=%s',
            text_to_display)
        driver.push_task('display', text_to_display)
