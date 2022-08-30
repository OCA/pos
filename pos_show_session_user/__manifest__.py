# Copyright 2022 KMEE (https://www.kmee.com.br).
# @author Luis Felipe Mileo <mileo@kmee.com.br>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). -->

{
    "name": "PoS show session user",
    "version": "14.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Point of sale: Show session user",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "maintainers": ["mileo"],
    "license": "LGPL-3",
    "depends": [
        "pos_hr",
    ],
    "data": [
        # Templates
        "views/pos_template.xml",
    ],
    "qweb": ["static/src/xml/ChromeWidgets/SessionUserName.xml"],
}
