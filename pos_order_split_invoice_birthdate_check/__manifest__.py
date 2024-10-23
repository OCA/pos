# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

{
    "name": "Pos Order Split Invoice Birthdate Check",
    "version": "17.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Add Splitted partner birthdate in Splitted invoice form view",
    "author": "INVITU,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["base", "pos_order_split_invoice", "pos_partner_birthdate"],
    "data": ["views/account_move_views.xml"],
    "installable": True,
}
