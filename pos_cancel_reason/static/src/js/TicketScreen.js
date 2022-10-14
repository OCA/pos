odoo.define('pos_cancel_reason.TicketScreen', function(require) {
    'use strict';

    const TicketScreen = require('point_of_sale.TicketScreen');
    const Registries = require("point_of_sale.Registries");

    const PosTicketScreen = (TicketScreen) =>
        class extends TicketScreen {
            async deleteOrder(order) {
                let compared_time = ((new Date() - new Date(this.env.pos.get_order().creation_date)) / 1000) > this.env.pos.config.delay_to_cancel;
                if (!this.env.pos.config.reason_to_cancel || !compared_time) {
                    super.deleteOrder(order);
                } else {
                    const screen = order.get_screen_data();
                    if (['ProductScreen', 'PaymentScreen'].includes(screen.name) && order.get_orderlines().length > 0) {
                        const { confirmed } = await this.showPopup('ConfirmPopup', {
                            title: this.env._t('Existing orderlines'),
                            body: _.str.sprintf(
                            this.env._t('%s has a total amount of %s, are you sure you want to delete this order ?'),
                            order.name, this.getTotal(order)
                            ),
                        });
                        if (!confirmed) return;
                    }
                    if (order) {
                        let cancel_reason_options = [];
                        for (let i in this.env.pos.cancel_reasons) {
                            cancel_reason_options.push({
                                id: this.env.pos.cancel_reasons[i].id,
                                label: this.env.pos.cancel_reasons[i].name,
                                item: this.env.pos.cancel_reasons[i],
                            });
                        }
                        const {confirmed, payload: selectedOption} = await this.showPopup(
                            "SelectionPopup",
                            {
                                title: this.env._t("What is the reason for cancel these order?"),
                                list: cancel_reason_options,
                            }
                        );
                        if (confirmed) {
                            order.cancel_reason_id = selectedOption.id;
                            order.state = "cancel";
                            await this.env.pos.push_single_order(order);
                            await this._canDeleteOrder(order);
                            order.destroy({ reason: 'abandon' });
                        }
                    }
                }
            }
        }

    Registries.Component.extend(TicketScreen, PosTicketScreen);

    return TicketScreen;
});
