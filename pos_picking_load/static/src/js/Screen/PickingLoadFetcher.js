odoo.define("pos_picking_load.PickingLoadFetcher", function (require) {
    "use strict";
    /* eslint-disable no-undef */
    const {Gui} = require("point_of_sale.Gui");
    const {isConnectionError} = require("point_of_sale.utils");

    const {EventBus} = owl;

    class PickingLoadFetcher extends EventBus {
        constructor() {
            super();
            this.ordersToShow = [];
        }

        async fetch() {
            try {
                this.ordersToShow = await this._fetch();
                this.trigger("update");
            } catch (error) {
                if (isConnectionError(error)) {
                    Gui.showPopup("ErrorPopup", {
                        title: this.comp.env._t("Network Error"),
                        body: this.comp.env._t("Unable to fetch orders if offline."),
                    });
                    Gui.setSyncStatus("error");
                } else {
                    throw error;
                }
            }
        }

        async _fetch() {
            const picking_orders = await this._getOrderIdsForCurrentPage();
            return picking_orders;
        }
        async _getOrderIdsForCurrentPage() {
            const pickingOrders = await this.rpc({
                model: "stock.picking",
                method: "search_pickings_for_pos",
                args: [this.searchDomain || "", this.comp.env.pos.pos_session.id],
            });
            //            _.findWhere(pickingOrders, {id: this.comp.current_picking_data.id})
            return pickingOrders;
        }
        /* eslint-disable */
        get(id) {
            return this.ordersToShow;
        }
        setSearchDomain(searchDomain) {
            this.searchDomain = searchDomain;
        }
        setComponent(comp) {
            this.comp = comp;
            return this;
        }
        async rpc() {
            Gui.setSyncStatus("connecting");
            const result = await this.comp.rpc(...arguments);
            Gui.setSyncStatus("connected");
            return result;
        }
    }

    return new PickingLoadFetcher();
});
