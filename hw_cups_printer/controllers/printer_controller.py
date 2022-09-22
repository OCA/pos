from odoo import http
from odoo.addons.hw_drivers.main import iot_devices
from odoo.addons.hw_drivers.controllers.proxy import proxy_drivers


@classmethod
def get_status(cls):
    return {'status': 'connected', 'messages': ''}


while True:
    if proxy_drivers.get('printer'):
        proxy_drivers['printer'].get_status = get_status
        break


class PrinterController(http.Controller):

    @http.route('/hw_proxy/named_printer_action', type='json', auth='none', cors='*')
    def default_printer_action(self, data):
        if data.get('printer_name'):
            printer = next((d for d in iot_devices if iot_devices[d].device_type == 'printer' and iot_devices[data.pop('printer_name')]), None)
            if printer:
                iot_devices[printer].action(data)
                return True
        return False
