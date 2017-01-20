# -*- encoding: utf-8 -*-
##############################################################################
#
#    Hardware Telium Payment Terminal module for Odoo
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
import curses.ascii
from threading import Thread, Lock
from Queue import Queue
import openerp.addons.hw_proxy.controllers.main as hw_proxy
from openerp import http
from openerp.tools.config import config

logger = logging.getLogger(__name__)

try:
    import pycountry
    from serial import Serial
except (ImportError, IOError) as err:
    logger.debug(err)


class TeliumPaymentTerminalDriver(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.queue = Queue()
        self.lock = Lock()
        self.status = {'status': 'connecting', 'messages': []}
        self.device_name = config.get(
            'telium_terminal_device_name', '/dev/ttyACM0')
        self.device_rate = int(config.get(
            'telium_terminal_device_rate', 9600))
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
            logger.error('Payment Terminal Error: '+message)
        elif status == 'disconnected' and message:
            logger.warning('Disconnected Terminal: '+message)

    def lockedstart(self):
        with self.lock:
            if not self.isAlive():
                self.daemon = True
                self.start()

    def push_task(self, task, data=None):
        self.lockedstart()
        self.queue.put((time.time(), task, data))

    def serial_write(self, text):
        assert isinstance(text, str), 'text must be a string'
        self.serial.write(text)

    def initialize_msg(self):
        max_attempt = 3
        attempt_nr = 0
        while attempt_nr < max_attempt:
            attempt_nr += 1
            self.send_one_byte_signal('ENQ')
            if self.get_one_byte_answer('ACK'):
                return True
            else:
                logger.warning("Terminal : SAME PLAYER TRY AGAIN")
                self.send_one_byte_signal('EOT')
                # Wait 1 sec between each attempt
                time.sleep(1)
        return False

    def send_one_byte_signal(self, signal):
        ascii_names = curses.ascii.controlnames
        assert signal in ascii_names, 'Wrong signal'
        char = ascii_names.index(signal)
        self.serial_write(chr(char))
        logger.debug('Signal %s sent to terminal' % signal)

    def get_one_byte_answer(self, expected_signal):
        ascii_names = curses.ascii.controlnames
        one_byte_read = self.serial.read(1)
        expected_char = ascii_names.index(expected_signal)
        if one_byte_read == chr(expected_char):
            logger.debug("%s received from terminal" % expected_signal)
            return True
        else:
            return False

    def prepare_data_to_send(self, payment_info_dict):
        amount = payment_info_dict['amount']
        if payment_info_dict['payment_mode'] == 'check':
            payment_mode = 'C'
        elif payment_info_dict['payment_mode'] == 'card':
            payment_mode = '1'
        else:
            logger.error(
                "The payment mode '%s' is not supported"
                % payment_info_dict['payment_mode'])
            return False
        cur_iso_letter = payment_info_dict['currency_iso'].upper()
        try:
            cur = pycountry.currencies.get(letter=cur_iso_letter)
            cur_numeric = str(cur.numeric)
        except:
            logger.error("Currency %s is not recognized" % cur_iso_letter)
            return False
        data = {
            'pos_number': str(1).zfill(2),
            'answer_flag': '0',
            'transaction_type': '0',
            'payment_mode': payment_mode,
            'currency_numeric': cur_numeric.zfill(3),
            'private': ' ' * 10,
            'delay': 'A011',
            'auto': 'B010',
            'amount_msg': ('%.0f' % (amount * 100)).zfill(8),
        }
        return data

    def generate_lrc(self, real_msg_with_etx):
        lrc = 0
        for char in real_msg_with_etx:
            lrc ^= ord(char)
        return lrc

    def send_message(self, data):
        '''We use protocol E+'''
        ascii_names = curses.ascii.controlnames
        real_msg = (
            data['pos_number'] +
            data['amount_msg'] +
            data['answer_flag'] +
            data['payment_mode'] +
            data['transaction_type'] +
            data['currency_numeric'] +
            data['private'] +
            data['delay'] +
            data['auto'])
        logger.debug('Real message to send = %s' % real_msg)
        assert len(real_msg) == 34, 'Wrong length for protocol E+'
        real_msg_with_etx = real_msg + chr(ascii_names.index('ETX'))
        lrc = self.generate_lrc(real_msg_with_etx)
        message = chr(ascii_names.index('STX')) + real_msg_with_etx + chr(lrc)
        self.serial_write(message)
        logger.info('Message sent to terminal')

    def compare_data_vs_answer(self, data, answer_data):
        for field in [
                'pos_number', 'amount_msg',
                'currency_numeric', 'private']:
            if data[field] != answer_data[field]:
                logger.warning(
                    "Field %s has value '%s' in data and value '%s' in answer"
                    % (field, data[field], answer_data[field]))

    def parse_terminal_answer(self, real_msg, data):
        answer_data = {
            'pos_number': real_msg[0:2],
            'transaction_result': real_msg[2],
            'amount_msg': real_msg[3:11],
            'payment_mode': real_msg[11],
            'currency_numeric': real_msg[12:15],
            'private': real_msg[15:26],
        }
        logger.debug('answer_data = %s' % answer_data)
        self.compare_data_vs_answer(data, answer_data)
        return answer_data

    def get_answer_from_terminal(self, data):
        ascii_names = curses.ascii.controlnames
        full_msg_size = 1+2+1+8+1+3+10+1+1
        msg = self.serial.read(size=full_msg_size)
        logger.debug('%d bytes read from terminal' % full_msg_size)
        assert len(msg) == full_msg_size, 'Answer has a wrong size'
        if msg[0] != chr(ascii_names.index('STX')):
            logger.error(
                'The first byte of the answer from terminal should be STX')
        if msg[-2] != chr(ascii_names.index('ETX')):
            logger.error(
                'The byte before final of the answer from terminal '
                'should be ETX')
        lrc = msg[-1]
        computed_lrc = chr(self.generate_lrc(msg[1:-1]))
        if computed_lrc != lrc:
            logger.error(
                'The LRC of the answer from terminal is wrong')
        real_msg = msg[1:-2]
        logger.debug('Real answer received = %s' % real_msg)
        return self.parse_terminal_answer(real_msg, data)

    def transaction_start(self, payment_info):
        '''This function sends the data to the serial/usb port.
        '''
        payment_info_dict = simplejson.loads(payment_info)
        assert isinstance(payment_info_dict, dict), \
            'payment_info_dict should be a dict'
        try:
            logger.debug(
                'Opening serial port %s for payment terminal with baudrate %d'
                % (self.device_name, self.device_rate))
            # IMPORTANT : don't modify timeout=3 seconds
            # This parameter is very important ; the Telium spec say
            # that we have to wait to up 3 seconds to get LRC
            self.serial = Serial(
                self.device_name, self.device_rate,
                timeout=3)
            logger.debug('serial.is_open = %s' % self.serial.isOpen())
            if self.initialize_msg():
                data = self.prepare_data_to_send(payment_info_dict)
                if not data:
                    return
                self.send_message(data)
                if self.get_one_byte_answer('ACK'):
                    self.send_one_byte_signal('EOT')

                    logger.info("Now expecting answer from Terminal")
                    if self.get_one_byte_answer('ENQ'):
                        self.send_one_byte_signal('ACK')
                        self.get_answer_from_terminal(data)
                        self.send_one_byte_signal('ACK')
                        if self.get_one_byte_answer('EOT'):
                            logger.info("Answer received from Terminal")

        except Exception, e:
            logger.error('Exception in serial connection: %s' % str(e))
        finally:
            if self.serial:
                logger.debug('Closing serial port for payment terminal')
                self.serial.close()

    def run(self):
        while True:
            try:
                timestamp, task, data = self.queue.get(True)
                if task == 'transaction_start':
                    self.transaction_start(data)
                elif task == 'status':
                    pass
            except Exception as e:
                self.set_status('error', str(e))


driver = TeliumPaymentTerminalDriver()

hw_proxy.drivers['telium_payment_terminal'] = driver


class TeliumPaymentTerminalProxy(hw_proxy.Proxy):
    @http.route(
        '/hw_proxy/payment_terminal_transaction_start',
        type='json', auth='none', cors='*')
    def payment_terminal_transaction_start(self, payment_info):
        logger.debug(
            'Telium: Call payment_terminal_transaction_start with '
            'payment_info=%s', payment_info)
        driver.push_task('transaction_start', payment_info)
