import logging

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class OrderZipcode(models.Model):
    _name = "order.zipcode"
    _rec_name = "zip_code"

    zip_code = fields.Char()
    state_id = fields.Many2one("res.country.state", string="State", ondelete="restrict")
    country_id = fields.Many2one("res.country", string="Country", ondelete="restrict")
    order_count = fields.Integer(compute="_compute_order_count")
    city = fields.Char()
    county = fields.Char()

    @api.onchange("state_id")
    def change_country_id(self):
        for zip_code in self:
            if zip_code.state_id:
                zip_code.country_id = (
                    zip_code.state_id.country_id and zip_code.state_id.country_id.id
                )

    # compute the number of pos orders with a zip code
    def _compute_order_count(self):
        for zip_code in self:
            order_count = self.env["pos.order"].search_count(
                [
                    ("zip_code", "=like", zip_code.zip_code + "%"),
                    ("state", "!=", "cancel"),
                ]
            )
            zip_code.order_count = order_count

    # Check if the entered zipcode is valid
    @api.model
    def search_order_zipcode(self, zipcode):
        valid_zip_code = self.search([("zip_code", "=", zipcode[:5])])
        if valid_zip_code:
            return True
        return False

    @api.constrains("zip_code")
    def check_zip_code(self):
        for zip_code in self:
            if self.search(
                [("zip_code", "=", zip_code.zip_code), ("id", "!=", zip_code.id)]
            ):
                raise ValidationError(
                    _("Another record with the same zip code already exists!")
                )

    def test_time(self):
        import time

        i = 0
        try:
            while True:
                _logger.error(time.ctime())
                time.sleep(60)
                i += 1
                _logger.error(time.ctime())
        except Exception as e:
            _logger.error(e)

    def get_zipcode_for_pos(self):
        zipcodes = self.sudo().search()
        return zipcodes.mapped("name")
