# Copyright 2021 - Today Coop IT Easy SCRLfs (<http://www.coopiteasy.be>)
# - Grégoire Leeuwerck <gregoire@coopiteasy.be>
# - Vincent Van Rossem <vincent@coopiteasy.be>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
{
    "name": "Point Of Sale - Self-Service Print ZPL",
    "summary": "POS Self-Service Print ZPL from browser",
    "version": "12.0.1.0.0",
    "category": "Point of Sale",
    "author": "Coop IT Easy SCRLfs, Odoo Community Association (OCA)",
    "website": "https://coopiteasy.be",
    "license": "AGPL-3",
    "depends": ["pos_self_service_base"],
    "data": ["views/templates.xml", "views/pos_config_view.xml"],
    "qweb": ["static/src/xml/pos_self_service.xml"],
    "installable": True,
}
