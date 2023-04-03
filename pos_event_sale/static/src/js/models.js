/*
    Copyright 2021 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");

    models.load_fields("product.product", ["detailed_type"]);

    models.load_models([
        {
            model: "event.event",
            after: "product.product",
            label: "Events",
            fields: [
                "name",
                "display_name",
                "event_type_id",
                "tag_ids",
                "country_id",
                "date_begin",
                "date_end",
                "date_tz",
                "seats_limited",
                "seats_available",
            ],
            condition: function (self) {
                return self.config.iface_event_sale;
            },
            domain: function (self) {
                const domain = [
                    ["company_id", "in", [false, self.config.company_id[0]]],
                    ["event_ticket_ids.product_id.active", "=", true],
                    ["event_ticket_ids.available_in_pos", "=", true],
                ];
                if (self.config.iface_available_event_stage_ids.length) {
                    const event_stage_ids = self.config.iface_available_event_stage_ids;
                    domain.push(["stage_id", "in", event_stage_ids]);
                }
                if (self.config.iface_available_event_type_ids.length) {
                    const event_type_ids = self.config.iface_available_event_type_ids;
                    domain.push(["event_type_id", "in", event_type_ids]);
                }
                if (self.config.iface_available_event_tag_ids.length) {
                    const event_tag_ids = self.config.iface_available_event_tag_ids;
                    domain.push(["tag_ids", "in", event_tag_ids]);
                }
                if (self.config.iface_event_load_days_before >= 0) {
                    const date_end = moment()
                        .subtract(self.config.iface_event_load_days_before, "days")
                        .toDate();
                    domain.push(["date_end", ">=", date_end]);
                }
                if (self.config.iface_event_load_days_after >= 0) {
                    const date_start = moment()
                        .add(self.config.iface_event_load_days_after, "days")
                        .toDate();
                    domain.push(["date_start", "<=", date_start]);
                }
                return domain;
            },
            loaded: function (self, records) {
                self.db.addEvents(
                    records.map((record) => {
                        record.pos = self;
                        return new models.EventEvent({}, record);
                    })
                );
            },
        },
        {
            model: "event.event.ticket",
            after: "event.event",
            label: "Event Tickets",
            fields: [
                "name",
                "description",
                "event_id",
                "product_id",
                "price",
                "seats_limited",
                "seats_available",
            ],
            condition: function (self) {
                return self.config.iface_event_sale;
            },
            domain: function (self) {
                const event_ids = Object.keys(self.db.event_by_id).map((id) =>
                    Number(id)
                );
                return [
                    ["product_id.active", "=", true],
                    ["available_in_pos", "=", true],
                    ["event_id", "in", event_ids],
                ];
            },
            loaded: function (self, records) {
                self.db.addEventTickets(
                    records.map((record) => {
                        record.pos = self;
                        return new models.EventTicket({}, record);
                    })
                );
            },
        },
        {
            model: "event.tag.category",
            after: "event.event",
            label: "Event Tag Categories",
            fields: ["name"],
            condition: function (self) {
                return self.config.iface_event_sale;
            },
            loaded: function (self, records) {
                self.db.event_tag_category_by_id = {};
                self.db.event_tags = records;
                for (const record of records) {
                    record.tag_ids = [];
                    self.db.event_tag_category_by_id[record.id] = record;
                }
            },
        },
        {
            model: "event.tag",
            after: "event.tag.category",
            label: "Event Tags",
            fields: ["name", "category_id", "color"],
            condition: function (self) {
                return self.config.iface_event_sale;
            },
            loaded: function (self, records) {
                for (const record of records) {
                    const category =
                        self.db.event_tag_category_by_id[record.category_id[0]];
                    if (category) {
                        category.tag_ids.push(record);
                    }
                }
            },
        },
    ]);

    return models;
});
