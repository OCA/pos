# Copyright 2018-21 ForgeFlow S.L. (https://www.forgeflow.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import json
import logging
import pprint
import random
import requests
import string

from odoo import fields, models, api, _

_logger = logging.getLogger(__name__)


class AccountJournal(models.Model):
    _inherit = 'account.journal'

    def _get_payment_terminal_selection(self):
        return (
            super()._get_payment_terminal_selection() + [('adyen', 'Adyen')]
        )

    adyen_api_key = fields.Char(
        string="Adyen API key",
        help='Used when connecting to Adyen: https://docs.adyen.com/user-management/how-to-get-the-api-key/#description',
        copy=False
    )
    adyen_merchant_account = fields.Char(
        string="Adyen Merchant Account",
        help='Used when connecting to Adyen',
        copy=False
    )
    adyen_test_mode = fields.Boolean(
        help='Run transactions in the test environment.'
    )

    def _adyen_diagnosis_request_data(self, pos_config_name, terminal_identifier):
        service_id = ''.join(random.sample(string.ascii_letters + string.digits, k=10))
        return {
            "SaleToPOIRequest": {
                "MessageHeader": {
                    "ProtocolVersion": "3.0",
                    "MessageClass": "Service",
                    "MessageCategory": "Diagnosis",
                    "MessageType": "Request",
                    "ServiceID": service_id,
                    "SaleID": pos_config_name,
                    "POIID": terminal_identifier,
                },
                "DiagnosisRequest": {
                    "HostDiagnosisFlag": False
                }
            }
        }

    @api.model
    def get_latest_adyen_status(self, payment_method_id, pos_config_name,
                                terminal_identifier, test_mode, api_key):
        """
            See the description of proxy_adyen_request as to why this is an
            @api.model function.
        """

        # Poll the status of the terminal if there's no new
        # notification we received. This is done so we can quickly
        # notify the user if the terminal is no longer reachable due
        # to connectivity issues.
        pos_config = self.env["pos.config"].get_pos_config_from_adyen_terminal(
            terminal_identifier
        )
        self.proxy_adyen_request(self._adyen_diagnosis_request_data(
            pos_config_name, terminal_identifier), test_mode, api_key)
        _logger.info('payment method id: %s', payment_method_id)
        latest_response = pos_config.adyen_latest_response
        latest_response = json.loads(latest_response) if latest_response else False
        _logger.info('latest response:\n%s', latest_response)
        # avoid handling old responses multiple times
        pos_config.adyen_latest_response = ''

        return {
            'latest_response': latest_response,
            'last_received_diagnosis_id': pos_config.adyen_latest_diagnosis,
        }

    @api.model
    def proxy_adyen_request(self, data, test_mode, api_key):
        '''Necessary because Adyen's endpoints don't have CORS enabled. This is an
        @api.model function to avoid concurrent update errors. Adyen's
        async endpoint can still take well over a second to complete a
        request. By using @api.model and passing in all data we need from
        the POS we avoid locking the pos_payment_method table. This way we
        avoid concurrent update errors when Adyen calls us back on
        /pos_adyen/notification which will need to write on
        pos.payment.method.
        '''
        TIMEOUT = 10
        endpoint = 'https://terminal-api-live.adyen.com/async'
        if test_mode:
            endpoint = 'https://terminal-api-test.adyen.com/async'

        _logger.info('request to adyen\n%s', pprint.pformat(data))
        headers = {
            'x-api-key': api_key,
            'Content-Type': 'application/json'
        }
        req = requests.post(
            endpoint, data=json.dumps(data), headers=headers, timeout=TIMEOUT)
        _logger.info(
            'response from adyen (HTTP status %s):\n%s',
            req.status_code, req.text
        )

        # Authentication error doesn't return JSON
        if req.status_code == 401:
            return {
                'error': {
                    'status_code': req.status_code,
                    'message': req.text
                }
            }

        if req.text == 'ok':
            return True

        return req.json()

    @api.model
    def adyen_make_payment_request(self, data, test_mode, api_key):
        TIMEOUT = 10
        endpoint = 'https://checkout-adyen.adyen.com/v66/payments'
        if test_mode:
            endpoint = 'https://checkout-test.adyen.com/v66/payments'

        _logger.info('request to adyen\n%s', pprint.pformat(data))
        headers = {
            'x-api-key': api_key,
            'Content-Type': 'application/json'
        }
        req = requests.post(
            endpoint, data=json.dumps(data), headers=headers, timeout=TIMEOUT)
        _logger.info(
            'response from adyen (HTTP status %s):\n%s',
            req.status_code, req.text
        )

        # Authentication error doesn't return JSON
        if req.status_code == 401:
            return {
                'error': {
                    'status_code': req.status_code,
                    'message': req.text
                }
            }

        return req.json()

    @api.onchange('use_payment_terminal')
    def _onchange_use_payment_terminal(self):
        super()._onchange_use_payment_terminal()
        if self.use_payment_terminal != 'adyen':
            self.adyen_api_key = False
