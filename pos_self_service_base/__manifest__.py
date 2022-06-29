# Copyright 2021 - Today Coop IT Easy SC (<http://www.coopiteasy.be>)
# - Grégoire Leeuwerck <gregoire@coopiteasy.be>
# - Vincent Van Rossem <vincent@coopiteasy.be>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
{
    "name": "Point Of Sale - Self-Service",
    "summary": "POS Self-Service Base Module",
    "version": "12.0.1.0.0",
    "category": "Point of Sale",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "website": "https://coopiteasy.be",
    "license": "AGPL-3",
    "depends": ["point_of_sale", "pos_tare"],
    "data": ["views/templates.xml", "views/pos_config_view.xml"],
    "qweb": ["static/src/xml/pos_self_service.xml"],
    "installable": True,
}
