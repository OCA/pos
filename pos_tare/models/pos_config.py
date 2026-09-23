from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_tare_method = fields.Selection(
        [
            ("manual", "Input the tare manually"),
            ("barcode", "Scan a barcode to set the tare"),
            ("both", "Manual input and barcode"),
        ],
        string="Tare Input Method",
        default="both",
        required=True,
        help="Select tare method:\n"
        "* 'manual': the scale screen has an extra tare input field;\n"
        "* 'barcode': scan a barcode to tare the selected order line;\n"
        "* 'both': manual input and barcode methods are enabled;",
    )

    iface_gross_weight_method = fields.Selection(
        [
            ("manual", "Input the Gross Weight manually"),
            ("scale", "Input Gross Weight via Scale"),
        ],
        string="Gross Weight Input Method",
        default="scale",
        required=True,
    )

    iface_send_tare_to_scale = fields.Boolean(
        "Send Tare Weight To Scale",
        help=(
            "Send the tare weight when reading the scale value, to allow the "
            "scale to display the tare and the net weights. Requires a "
            "compatible device proxy, like odoo-driver."
        ),
    )

    iface_tare_uom_id = fields.Many2one(
        string="Unit of Measure of the tare",
        comodel_name="uom.uom",
        default=lambda s: s._default_iface_tare_uom_id(),
        domain=lambda s: s._tare_uom_id_domain(),
        required=True,
    )

    @api.model
    def _default_iface_tare_uom_id(self):
        return self.env.ref("uom.product_uom_kgm")

    @api.model
    def _tare_uom_id_domain(self):
        return [("category_id", "=", self.env.ref("uom.product_uom_categ_kgm").id)]
