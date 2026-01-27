odoo.define("pos_picking_load.widget", function (require) {
    "use strict";
    /* eslint-disable no-undef */
    const PosComponent = require("point_of_sale.PosComponent");
    const ProductScreen = require("point_of_sale.ProductScreen");
    const {useListener} = require("@web/core/utils/hooks");
    const Registries = require("point_of_sale.Registries");
    const {isConnectionError} = require("point_of_sale.utils");
    const {Gui} = require("point_of_sale.Gui");

    class LoadPickingButtonWidget extends PosComponent {
        setup() {
            super.setup();
            useListener("click", this.onClick);
        }
        get currentOrder() {
            return this.env.pos.get_order();
        }
        get button_text() {
            if (
                !this.env.pos.get_order() ||
                _.isUndefined(this.env.pos.get_order().origin_picking_id)
            ) {
                return this.env._t("Load Picking");
            }
            return this.env.pos.get_order().origin_picking_name;
        }
        async onClick() {
            try {
                if (_.isUndefined(this.env.pos.get_order().origin_picking_id)) {
                    Gui.showScreen("LoadPickingScreenWidget");
                } else {
                    this.showPopup("ErrorPopup", {
                        title: this.env._t("Pending Picking"),
                        body: this.env._t(
                            "A picking is still loaded. You can not load" +
                                " another picking. Please create a new order."
                        ),
                    });
                }
            } catch (error) {
                if (isConnectionError(error)) {
                    this.showPopup("ErrorPopup", {
                        title: this.env._t("Network Error"),
                        body: this.env._t(
                            "Cannot access order management screen if offline."
                        ),
                    });
                } else {
                    throw error;
                }
            }
        }
    }
    LoadPickingButtonWidget.template = "LoadPickingButtonWidget";

    ProductScreen.addControlButton({
        component: LoadPickingButtonWidget,
        condition: function () {
            if (this.env.pos.config.iface_load_picking) {
                if (this.env.pos.get_order()) {
                    return (
                        this.env.pos.get_order().get_orderlines().length === 0 ||
                        !_.isUndefined(this.env.pos.get_order().origin_picking_id)
                    );
                }
            }
            return false;
        },
    });
    Registries.Component.add(LoadPickingButtonWidget);
    return LoadPickingButtonWidget;
});
