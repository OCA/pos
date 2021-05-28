from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    group_negative_qty_id = fields.Many2one(
        comodel_name="res.groups",
        compute="_compute_groups",
        string="Point of Sale - Allow Negative Quantity",
        help="This field is there to pass the id of the 'PoS - Allow Negative"
        " Quantity' Group to the Point of Sale Frontend.",
    )

    group_discount_id = fields.Many2one(
        comodel_name="res.groups",
        compute="_compute_groups",
        string="Point of Sale - Allow Discount",
        help="This field is there to pass the id of the 'PoS - Allow Discount'"
        " Group to the Point of Sale Frontend.",
    )

    group_change_unit_price_id = fields.Many2one(
        comodel_name="res.groups",
        compute="_compute_groups",
        string="Point of Sale - Allow Unit Price Change",
        help="This field is there to pass the id of the 'PoS - Allow Unit"
        " Price Change' Group to the Point of Sale Frontend.",
    )

    group_multi_order_id = fields.Many2one(
        comodel_name="res.groups",
        compute="_compute_groups",
        string="Point of Sale - Many Orders",
        help="This field is there to pass the id of the 'PoS - Many Orders"
        " Group to the Point of Sale Frontend.",
    )

    group_delete_order_id = fields.Many2one(
        comodel_name="res.groups",
        compute="_compute_groups",
        string="Point of Sale - Delete Order",
        help="This field is there to pass the id of the 'PoS - Delete Order'"
        " Group to the Point of Sale Frontend.",
    )

    group_payment_id = fields.Many2one(
        comodel_name="res.groups",
        compute="_compute_groups",
        string="Point of Sale - Payment",
        help="This field is there to pass the id of the 'PoS - Payment'"
        " Group to the Point of Sale Frontend.",
    )

    def _compute_groups(self):
        self.update(
            {
                "group_negative_qty_id": self.env.ref(
                    "pos_access_right.group_negative_qty"
                ).id,
                "group_discount_id": self.env.ref("pos_access_right.group_discount").id,
                "group_change_unit_price_id": self.env.ref(
                    "pos_access_right.group_change_unit_price"
                ).id,
                "group_multi_order_id": self.env.ref(
                    "pos_access_right.group_multi_order"
                ).id,
                "group_delete_order_id": self.env.ref(
                    "pos_access_right.group_delete_order"
                ).id,
                "group_payment_id": self.env.ref("pos_access_right.group_payment").id,
            }
        )
