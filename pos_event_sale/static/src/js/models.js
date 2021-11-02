/*
Copyright 2021 Camptocamp SA - Iván Todorovich
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_event_sale.models", function(require) {
    "use strict";

    const models = require("point_of_sale.models");

    models.load_fields("product.product", ["event_ok"]);

    models.load_models([
        {
            model: "event.event",
            label: "Events",
            fields: [
                "name",
                "display_name",
                "event_type_id",
                "country_id",
                "date_begin",
                "date_end",
                "seats_availability",
                "seats_available",
            ],
            condition: function(self) {
                return self.config.iface_event_sale;
            },
            domain: function(self) {
                const domain = [
                    ["state", "=", "confirm"],
                    "|",
                    ["company_id", "=", self.config.company_id[0]],
                    ["company_id", "=", false],
                ];
                if (self.config.iface_available_event_type_ids.length) {
                    domain.push([
                        "event_type_id",
                        "in",
                        self.config.iface_available_event_type_ids,
                    ]);
                }
                if (!self.config.iface_load_past_events) {
                    domain.push(["date_end", ">=", new Date()]);
                }
                return domain;
            },
            loaded: function(self, records) {
                self.db.add_events(records);
            },
        },
        {
            model: "event.event.ticket",
            after: "event.event",
            label: "Event Tickets",
            fields: [
                "name",
                "event_id",
                "product_id",
                "price",
                "seats_availability",
                "seats_available",
            ],
            condition: function(self) {
                return self.config.iface_event_sale;
            },
            domain: function(self) {
                const event_ids = Object.keys(self.db.event_by_id).map(id =>
                    Number(id)
                );
                return [
                    ["product_id.active", "=", true],
                    ["product_id.available_in_pos", "=", true],
                    ["event_id", "in", event_ids],
                ];
            },
            loaded: function(self, records) {
                self.db.add_event_tickets(records);
            },
        },
    ]);

    return models;
});
