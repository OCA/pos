/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.models", function (require) {
    "use strict";

    const models = require("pos_event_sale.models");

    models.load_fields("event.event", ["use_sessions"]);

    models.load_models([
        {
            model: "event.session",
            after: "event.event",
            label: "Event Sessions",
            fields: [
                "event_id",
                "display_name",
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
                const event_ids = Object.keys(self.db.event_by_id).map((id) =>
                    Number(id)
                );
                const domain = [["event_id", "in", event_ids]];
                if (self.config.iface_available_event_stage_ids.length) {
                    const event_stage_ids = self.config.iface_available_event_stage_ids;
                    domain.push(["stage_id", "in", event_stage_ids]);
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
                self.db.addEventSessions(
                    records.map((record) => {
                        record.pos = self;
                        return new models.EventSession({}, record);
                    })
                );
            },
        },
    ]);

    return models;
});
