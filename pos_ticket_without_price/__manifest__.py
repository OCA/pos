# © 2019 Solvos Consultoría Informática (<http://www.solvos.es>)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS Ticket Without Price",
    "summary": "Adds receipt ticket without price or taxes",
    "version": "15.0.1.0.0",
    "author": "Odoo Community Association (OCA), Solvos",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "category": "Point Of Sale",
    "depends": ["point_of_sale"],
    "assets": {
        "web.assets_qweb": [
            "pos_ticket_without_price/static/src/xml/pos.xml",
        ],
        "point_of_sale.assets": [
            "pos_ticket_without_price/static/src/js/ReceiptScreen.js",
            "pos_ticket_without_price/static/src/js/OrderReceiptWithoutPrice.js",
        ],
    },
    "installable": True,
}
