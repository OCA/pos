# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Mail Receipt",
    "category": "Point Of Sale",
    "version": "12.0.1.0.0",
    "author": "Coop IT Easy SCRLfs, " "Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "templates/assets.xml",
        "data/email.xml",
        "views/pos_order_form_mail_receipt_sent.xml",
    ],
    "qweb": ["static/src/xml/pos.xml"],
    "installable": True,
}
