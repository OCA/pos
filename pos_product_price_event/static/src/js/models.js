/*  Copyright (C) 2023 KMEE (https://kmee.com.br)
    @author: Felipe Zago <felipe.zago@kmee.com.br>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_product_price_event.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");

    models.load_models([
        {
            model: "resource.product.event.price",
            fields: ["product_id", "price", "product_availability"],
            loaded: function (self, price_event_ids) {
                self.resource_event_by_id = {};
                _.each(price_event_ids, (ev) => {
                    self.resource_event_by_id[ev.id] = {
                        id: ev.id,
                        price: ev.price,
                        product_id: ev.product_id[0],
                        product_availability: ev.product_availability,
                    };
                });
            },
        },
        {
            model: "resource.product.event",
            fields: ["week_day", "price_event_ids"],
            domain: () => {
                return [
                    ["active", "=", true],
                    ["week_day", "=", new Date().getDay()],
                ];
            },
            loaded: function (self, event_id) {
                self.current_event_id = event_id[0];
                self.current_price_event_ids = self.current_event_id.price_event_ids.map(
                    (ev_id) => self.resource_event_by_id[ev_id]
                );
                self.available_event_products = _.map(
                    self.current_price_event_ids,
                    (ev) => ev.product_id
                );

                const unavailableEvents = _.filter(self.resource_event_by_id, (ev) => {
                    return (
                        !self.available_event_products.includes(ev.product_id) &&
                        ev.product_availability === "event_only"
                    );
                });
                self.productsToHide = _.map(
                    unavailableEvents,
                    (event) => event.product_id
                );
            },
        },
    ]);

    var _super_orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        // eslint-disable-next-line no-unused-vars
        initialize: function (attributes, options) {
            _super_orderline.initialize.apply(this, arguments);

            this.product_event_id = this.product_event_id || options.product_event_id;
        },

        init_from_JSON: function (json) {
            _super_orderline.init_from_JSON.apply(this, arguments);

            this.product_event_id = json.product_event_id;
        },

        export_as_JSON: function () {
            const json = _super_orderline.export_as_JSON.apply(this, arguments);

            json.product_event_id = this.product_event_id;

            return json;
        },
    });

    const _super_posmodel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        after_load_server_data: function () {
            _super_posmodel.after_load_server_data.call(this);

            _.each(this.current_price_event_ids, (event) => {
                const product = this.db.product_by_id[event.product_id];
                product.origin_price = product.lst_price;
                product.lst_price = event.price;
                product.product_event_id = event.id;
            });
        },
    });

    return models;
});
