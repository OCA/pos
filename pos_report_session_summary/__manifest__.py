# copyright Odoo SA
# copyright OCA
# Licence : LGPL-3

{
    "name": "POS report Session Summary",
    "version": "14.0.1.0.1",
    "category": "Point Of Sale",
    "summary": "Adds a Session Summary PDF report on the POS session",
    "author": "Akretion, Odoo SA, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/session_summary_report.xml", "views/report_session_summary.xml"],
    "installable": True,
    "application": False,
    "website": "https://github.com/OCA/pos",
    "auto_install": False,
}
