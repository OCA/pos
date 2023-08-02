# @author: François Kawala
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Point of Sale - Clear product search on click",
    "version": "15.0.1.0.0",
    "category": "Point of Sale",
    "summary": "Point of Sale - Clear product search when user clicks on a product.",
    "author": "Le Nid, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "maintainers": ["fkawala"],
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale.assets": ["/pos_reset_search/static/src/js/reset.js"],
    },
    "installable": True,
}
