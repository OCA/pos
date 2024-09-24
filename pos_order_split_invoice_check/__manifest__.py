# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

{
    "name": "Pos Order Split Invoice Check",
    "version": "17.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Add Splitting partner ref and barcode in Splitted invoice form view",
    "author": "INVITU,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["base", "pos_order_split_invoice"],
    "data": ["views/account_move_views.xml"],
    "installable": True,
}
