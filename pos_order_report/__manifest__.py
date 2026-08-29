{
    "name": "POS Order Pivot Export Wizard",
    "version": "18.0.1.0.0",
    "category": "Point Of Sale",
    "summary": """
    Export Point of Sale Analysis (report.pos.order) to Excel — just like
    Odoo's Pivot View
    """,
    "author": "Trobz, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "security/ir.model.access.csv",
        "wizard/pos_order_report_wizard.xml",
    ],
    "installable": True,
}
