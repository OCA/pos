odoo.define("pos_picking_load.LoadPickingScreenWidget", function (require) {
    "use strict";
    /* eslint-disable no-undef */
    const {useListener} = require("@web/core/utils/hooks");
    const ControlButtonsMixin = require("point_of_sale.ControlButtonsMixin");
    const Registries = require("point_of_sale.Registries");
    const PickingLoadFetcher = require("pos_picking_load.PickingLoadFetcher");
    const IndependentToOrderScreen = require("point_of_sale.IndependentToOrderScreen");
    const contexts = require("point_of_sale.PosContext");
    var rpc = require("web.rpc");
    var framework = require("web.framework");
    const {onMounted, onWillUnmount, useState} = owl;

    class LoadPickingScreenWidget extends ControlButtonsMixin(
        IndependentToOrderScreen
    ) {
        setup() {
            super.setup();
            useListener("close-screen", this.close);
            useListener("click-sale-order", this._onClickSelectPicking);
            useListener("search", this._onSearch);
            useListener("select-picking", this._onSelectPicking);
            PickingLoadFetcher.setComponent(this);
            this.orderManagementContext = useState(contexts.orderManagement);
            onMounted(this.onMounted);
            onWillUnmount(this.onWillUnmount);
            this.pos_picking_load = [];
            this.current_picking_data = [];
        }
        get_unknown_products(picking_data) {
            var self = this;
            var unknown_products = [];
            picking_data.line_ids.forEach(function (picking_line_data) {
                var product = self.env.pos.db.get_product_by_id(
                    picking_line_data.product_id
                );
                if (_.isUndefined(product)) {
                    unknown_products.push(picking_line_data.product_id);
                }
            });
            if (unknown_products.length) {
                this.env.pos._addProducts(unknown_products);
                return true;
            }
        }

        _onSelectPicking() {
            var order = this.env.pos.get_order();
            order.load_from_picking_data(this.current_picking_data);
            this.close();
        }
        onMounted() {
            PickingLoadFetcher.on("update", this, this.render);
            setTimeout(() => PickingLoadFetcher.fetch(), 0);
        }
        onWillUnmount() {
            PickingLoadFetcher.off("update", this);
        }
        get orders() {
            return PickingLoadFetcher.get();
        }
        _onSearch({detail: domain}) {
            PickingLoadFetcher.setSearchDomain(domain);
            PickingLoadFetcher.fetch();
        }
        async _onClickSelectPicking(event) {
            const clickedOrder = event.detail;
            this.current_picking_data = false;
            var origin_picking_id = clickedOrder.id;
            var self = this;
            var params = {
                model: "stock.picking",
                method: "load_picking_for_pos",
                args: [origin_picking_id],
            };
            rpc.query(params)
                .then(function (picking_data) {
                    framework.unblockUI();
                    if (self.check_picking(picking_data)) {
                        self.current_picking_data = picking_data;
                        self.pos_picking_load = clickedOrder;
                        self.onMounted();
                    }
                })
                .catch(function (error) {
                    framework.unblockUI();
                    self.handle_errors(error);
                });
        }

        check_picking(picking_data) {
            var self = this;
            var picking_selectable = true;
            var unknown_products = [];
            picking_data.line_ids.forEach(function (picking_line_data) {
                var line_name = picking_line_data.name.replace("\n", " ");
                var product = self.env.pos.db.get_product_by_id(
                    picking_line_data.product_id
                );
                if (_.isUndefined(product)) {
                    unknown_products.push(line_name);
                }
            });
            if (unknown_products.length > 0) {
                self.showPopup("ErrorPopup", {
                    title: self.env._t("Unknown Products"),
                    body:
                        self.env._t(
                            "Unable to load some picking lines because the" +
                                " products are not available in the POS" +
                                " cache.\n\n" +
                                "Please check that lines :\n\n  * "
                        ) + unknown_products.join("; \n  *"),
                });
                picking_selectable = false;
            }

            // Check if the partner is unknown
            var partner = self.env.pos.db.get_partner_by_id(picking_data.partner_id);

            if (_.isUndefined(partner)) {
                self.showPopup("ErrorPopup", {
                    title: self.env._t("Unknown Partner"),
                    body: self.env._t(
                        "Unable to load this picking because the partner" +
                            " is not known in the Point Of Sale" +
                            " as a customer"
                    ),
                });
                picking_selectable = false;
            }

            // Check if the picking is still loaded in another PoS tab
            self.env.pos.db.get_unpaid_orders().forEach(function (order) {
                if (order.origin_picking_id === picking_data.id) {
                    self.showPopup("ErrorPopup", {
                        title: self.env._t("Picking Still Loaded"),
                        body:
                            self.env._t(
                                "Unable to load this picking because it has" +
                                    " been loaded in another draft" +
                                    " PoS Order :\n\n"
                            ) + order.name,
                    });
                    picking_selectable = false;
                }
            });

            // Check if the picking has still been handled in another PoS Order
            self.env.pos.db.get_orders().forEach(function (order) {
                if (order.origin_picking_id.id === picking_data.id) {
                    self.showPopup("ErrorPopup", {
                        title: self.env._t("Picking Still Loaded"),
                        body:
                            self.env._t(
                                "Unable to load this picking because it has" +
                                    " been loaded in another confirmed" +
                                    " PoS Order :\n\n"
                            ) + order.name,
                    });
                    picking_selectable = false;
                }
            });
            return picking_selectable;
        }

        handle_errors(error) {
            var self = this;
            if (parseInt(error.code, 10) === 200) {
                // Business Logic Error, not a connection problem
                self.showPopup("ErrorPopup", {
                    title: error.data.message || self.env._t("Server Error"),
                    body:
                        error.data.debug ||
                        self.env._t(
                            "The server encountered an error while" +
                                " receiving your order."
                        ),
                });
            } else {
                self.showPopup("ErrorPopup", {
                    title: self.env._t("Connection error"),
                    body: self.env._t(
                        "Can not execute this action because the POS" +
                            " is currently offline"
                    ),
                });
            }
        }
    }
    LoadPickingScreenWidget.template = "LoadPickingScreenWidget";
    LoadPickingScreenWidget.hideOrderSelector = true;
    Registries.Component.add(LoadPickingScreenWidget);
    return LoadPickingScreenWidget;
});
