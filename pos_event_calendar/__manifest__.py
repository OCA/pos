# Copyright 2025 Moka
# @author Damien Horvat <damien@moka.cloud>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale Event Calendar",
    "summary": "Sell events from Point of Sale with a calendar view",
    "author": "Moka",
    "website": "https://moka.cloud",
    "category": "Event",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "maintainers": ["Moka"],
    "depends": ["point_of_sale", "event_sale", "pos_event"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_event_calendar/static/src/xml/*.xml",
            "pos_event_calendar/static/src/js/*.js",
            "pos_event_calendar/static/src/js/**/*.scss",
            "pos_event_calendar/static/src/js/**/*.js",
            "pos_event_calendar/static/src/js/**/*.xml",
        ],
    },
    "application": False,
    "installable": True,
    "auto_install": False,
}
