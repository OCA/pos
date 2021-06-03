odoo.define("pos_warning_exiting.Chrome", function (require) {
    "use strict";

    const Chrome = require("point_of_sale.Chrome");
    const Registries = require("point_of_sale.Registries");
    const {isRpcError} = require("point_of_sale.utils");

    var _super_chromemodel = Chrome.prototype;

    const PosWarningChrome = (Chrome) =>
        class extends Chrome {
            // @Override
            async _closePos() {
                const unpaidOrders = this.env.pos.db.get_unpaid_orders();
                const toLoseOrders = unpaidOrders.filter(
                    (order) =>
                        order.pos_session_id === this.env.pos.pos_session.id &&
                        order.lines.length
                );

                if (toLoseOrders.length) {
                    const orderDescriptions = toLoseOrders.map((order) => {
                        let description =
                            this.env._t("Order #") + order.sequence_number;
                        // Lazy dependency to pos_restaurant to display table information
                        if (order.table) {
                            description += this.env._t(" - Table: ") + order.table.name;
                        }
                        return description;
                    });
                    if (orderDescriptions.length) {
                        const message = this.env._t(
                            "You have some draft unpaid orders. " +
                                "You can exit temporarily the Point of Sale, but you " +
                                "will loose that orders if you close the session: "
                        );
                        const reason = message + orderDescriptions.join(", ");

                        const {confirmed} = await this.showPopup("ConfirmPopup", {
                            title: this.env._t("Offline Orders"),
                            body: reason,
                        });
                        if (confirmed) {
                            return this._checkConnectionAndClose();
                        }
                        return false;
                    }
                }

                return this._checkConnectionAndClose();
            }
            async _checkConnectionAndClose() {
                try {
                    // Ping the server, if no error, show the screen
                    await this.rpc({
                        model: "pos.order",
                        method: "browse",
                        args: [[]],
                        kwargs: {context: this.env.session.user_context},
                    });
                    await _super_chromemodel._closePos.apply(this, arguments);
                } catch (error) {
                    if (isRpcError(error) && error.message.code < 0) {
                        await this.showPopup("ErrorPopup", {
                            title: this.env._t("Network Connection Lost"),
                            body: this.env._t(
                                "It seems that you do not have a network connection at the moment." +
                                    " If you close this window, it will not be possible to re-sell" +
                                    " until you get your connection back."
                            ),
                        });
                    } else {
                        throw error;
                    }
                }
            }
        };

    Registries.Component.extend(Chrome, PosWarningChrome);

    return Chrome;
});
