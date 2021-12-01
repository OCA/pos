/*
    Copyright 2015-Today GRAP (http://www.grap.coop)
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
odoo.define("pos_customer_display.models", function(require) {
    "use strict";

    const models = require("point_of_sale.models");

    const PosModelSuper = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        /**
         * @override
         */
        after_load_server_data: function() {
            this.proxy.loadCustomerDisplayFormatter();
            return PosModelSuper.after_load_server_data.apply(this, arguments);
        },
    });

    const OrderSuper = models.Order.prototype;
    models.Order = models.Order.extend({
        /**
         * @override
         */
        init_from_JSON: function() {
            if (!this.pos.proxy.shouldUpdateCustomerDisplay()) {
                return OrderSuper.init_from_JSON.apply(this, arguments);
            }
            return this.pos.proxy.withoutCustomerDisplayUpdate(
                OrderSuper.init_from_JSON,
                this,
                arguments
            );
        },
        /**
         * @override
         */
        add_product: function() {
            if (!this.pos.proxy.shouldUpdateCustomerDisplay()) {
                return OrderSuper.add_product.apply(this, arguments);
            }
            const res = this.pos.proxy.withoutCustomerDisplayUpdate(
                OrderSuper.add_product,
                this,
                arguments
            );
            this.pos.proxy.sendToCustomerDisplay(
                this.pos.proxy.prepareCustomerDisplayMessage("orderline", [
                    this.get_last_orderline(),
                    "add_line",
                ])
            );
            return res;
        },
    });

    const OrderlineSuper = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        /**
         * @override
         */
        set_quantity: function(quantity) {
            if (!this.pos.proxy.shouldUpdateCustomerDisplay()) {
                return OrderlineSuper.set_quantity.apply(this, arguments);
            }
            // In the current Odoo design, set_quantity is called to remove line
            // so we prepare the message before because after the call of super the line is deleted.
            let message = "";
            if (quantity === "remove") {
                message = this.pos.proxy.prepareCustomerDisplayMessage("orderline", [
                    this,
                    "delete_line",
                ]);
            }
            const res = this.pos.proxy.withoutCustomerDisplayUpdate(
                OrderlineSuper.set_quantity,
                this,
                arguments
            );
            if (quantity !== "remove") {
                message = this.pos.proxy.prepareCustomerDisplayMessage("orderline", [
                    this,
                    "update_quantity",
                ]);
            }
            this.pos.proxy.sendToCustomerDisplay(message);
            return res;
        },
        /**
         * @override
         */
        set_discount: function() {
            if (!this.pos.proxy.shouldUpdateCustomerDisplay()) {
                return OrderlineSuper.set_discount.apply(this, arguments);
            }
            const res = this.pos.proxy.withoutCustomerDisplayUpdate(
                OrderlineSuper.set_discount,
                this,
                arguments
            );
            this.pos.proxy.sendToCustomerDisplay(
                this.pos.proxy.prepareCustomerDisplayMessage("orderline", [
                    this,
                    "update_discount",
                ])
            );
            return res;
        },
        /**
         * @override
         */
        set_unit_price: function() {
            if (!this.pos.proxy.shouldUpdateCustomerDisplay()) {
                return OrderlineSuper.set_unit_price.apply(this, arguments);
            }
            const res = this.pos.proxy.withoutCustomerDisplayUpdate(
                OrderlineSuper.set_unit_price,
                this,
                arguments
            );
            this.pos.proxy.sendToCustomerDisplay(
                this.pos.proxy.prepareCustomerDisplayMessage("orderline", [
                    this,
                    "update_unit_price",
                ])
            );
            return res;
        },
    });

    const _config = _.findWhere(models.PosModel.prototype.models, {
        model: "pos.config",
    });
    const _loadedSuper = _config.loaded;
    _config.loaded = function(self) {
        _loadedSuper.apply(this, arguments);
        if (self.config.iface_customer_display) {
            self.config.use_proxy = true;
        }
    };

    return models;
});
