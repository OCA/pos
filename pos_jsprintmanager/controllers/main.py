# Copyright 2020 ForgeFlow, S.L.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

import logging
import uuid
from hashlib import sha256

from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class JsPrintManagerController(http.Controller):

    @http.route('/jspm', type='http', auth="none")
    def get_jspm_license(self, **kw):
        """ Route called when google sends a Accept/Refuse auth """
        icp = request.env['ir.config_parameter'].sudo()
        license_owner = icp.get_param('jsprintmanager.license_owner')
        license_key = icp.get_param('jsprintmanager.license_key')
        uid = str(uuid.uuid1())
        shasign = sha256((license_key + uid).encode('utf-8'))
        license_hash = shasign.hexdigest()
        output = "|".join([license_owner, license_hash, uid])
        return request.make_response(output)
