# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.fr/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: La Louve
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html

{
    "name": "POS Receipt By Email",
    "version": "18.0.1.0.0",
    "category": "Custom",
    "author": "Druidoo, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/report_paperformat.xml",
        "views/view_pos_config_settings.xml",
        "data/email_template_data.xml",
        "data/ir_cron_data.xml",
        "views/view_res_partner.xml",
        "views/report_receipt.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_ticket_send_by_mail/static/src/js/*",
            "pos_ticket_send_by_mail/static/src/xml/*",
        ],
    },
    "installable": True,
}
