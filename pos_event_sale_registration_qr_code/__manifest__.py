# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale Registration QR Code",
    "summary": "Print registration QR codes on Point of Sale receipts",
    "author": "Moka Tourisme, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Marketing",
    "version": "15.0.1.0.0",
    "license": "AGPL-3",
    "maintainers": ["ivantodorovich"],
    "depends": ["pos_event_sale", "event_registration_qr_code"],
    "assets": {
        "web.assets_qweb": [
            "pos_event_sale_registration_qr_code/static/src/xml/**/*.xml",
        ],
    },
    "auto_install": True,
}
