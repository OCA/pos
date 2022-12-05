import logging

from odoo import _, http
from odoo.addons.hw_drivers.main import iot_devices
from odoo.addons.hw_drivers.controllers.proxy import proxy_drivers

_logger = logging.getLogger(__name__)

@classmethod
def get_status(cls):
    return {'status': 'connected', 'messages': ''}


while True:
    if proxy_drivers.get('printer'):
        proxy_drivers['printer'].get_status = get_status
        break


class PrinterController(http.Controller):

    @http.route('/hw_proxy/named_printer_action', type='json', auth='none', cors='*')
    def named_printer_action(self, data):
        _logger.info(_("Receive a new print job: name {}".format(data.get('printer_name'))))
        printer = data.get('printer_name')
        if printer:
            _logger.info(_("Printing to named printer {}".format(printer)))
            iot_devices[printer].action(data)
            return True
        else:
            _logger.info(_("Fallback to default printer {}".format(printer)))
            return self.default_printer_action(data)
