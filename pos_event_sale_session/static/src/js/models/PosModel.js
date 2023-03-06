/*
    Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_event_sale_session.PosModel", function (require) {
    "use strict";

    const models = require("pos_event_sale.PosModel");

    const PosModelSuper = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        /**
         * @override
         */
        async _loadMissingProducts(orders) {
            return Promise.all([
                PosModelSuper._loadMissingProducts.apply(this, arguments),
                this._loadMissingEventSessions(orders),
            ]);
        },
        /**
         * Load missing event.session data from orders that may be loaded from
         * localStorage or from export_for_ui.
         */
        async _loadMissingEventSessions(orders) {
            const missingEventSessionIds = [];
            for (const order of orders) {
                for (const line of order.lines) {
                    const eventSessionId = line[2].event_session_id;
                    if (
                        eventSessionId &&
                        !missingEventSessionIds.includes(eventSessionId)
                    ) {
                        if (!this.db.getEventSessionByID(eventSessionId, false)) {
                            missingEventSessionIds.push(eventSessionId);
                        }
                    }
                }
            }
            if (!missingEventSessionIds.length) {
                return;
            }
            const eventSessionModel = this.models.find(
                (model) => model.model === "event.session"
            );
            const eventSessions = await this.rpc({
                model: eventSessionModel.model,
                method: "read",
                args: [missingEventSessionIds, eventSessionModel.fields],
                context: this.session.user_context,
            });
            eventSessionModel.loaded(this, eventSessions);
        },
    });

    return models;
});
