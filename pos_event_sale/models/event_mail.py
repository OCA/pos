##############################################################################
# Copyright (c) 2023 braintec AG (https://braintec.com)
# All Rights Reserved
#
# Licensed under the AGPL-3.0 (http://www.gnu.org/licenses/agpl.html)
# See LICENSE file for full licensing details.
##############################################################################

from odoo import models


class EventMail(models.Model):
    _inherit = "event.mail"

    def _create_missing_mail_registrations(self, registrations):
        """Create mail registrations just for those partners with email.

        This way we also prevent long delays in the POS, at the time of the order validation.
        """
        return super()._create_missing_mail_registrations(
            registrations.filtered("email")
        )
