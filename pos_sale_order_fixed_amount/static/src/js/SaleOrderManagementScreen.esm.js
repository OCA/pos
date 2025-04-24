/** @odoo-module **/
import {Orderline} from "point_of_sale.models";
import {parse} from "web.field_utils";
import Registries from "point_of_sale.Registries";
import {sprintf} from "web.utils";
import SaleOrderManagementScreen from "pos_sale.SaleOrderManagementScreen";

function getId(fieldVal) {
    return fieldVal && fieldVal[0];
}

const FixAmountSaleOrderManagementScreen = (OriginSaleOrderManagementScreen) =>
    class extends OriginSaleOrderManagementScreen {
        async _onClickSaleOrder(event) {
            this.allowedFixedAmount = true;
            this.clickedOrder = event.detail;
            await super._onClickSaleOrder(...arguments);
            this.allowedFixedAmount = false;
        }
        showPopup(name, props) {
            if (name === "SelectionPopup" && this.allowedFixedAmount) {
                props.list = [
                    ...props.list,
                    {
                        id: props.list.length.toString(),
                        label: this.env._t("Apply a down payment (fixed amount)"),
                        item: "fixed_amount",
                    },
                ];
                this.allowedFixedAmount = false;
            }
            return super.showPopup(name, props).then(({confirmed, payload}) => {
                if (confirmed && payload === "fixed_amount") {
                    return this._down_payment_fixed_amount();
                }
                return {confirmed, payload};
            });
        }
        async _down_payment_fixed_amount() {
            const clickedOrder = this.clickedOrder;
            let currentPOSOrder = this.env.pos.get_order();
            const sale_order = await this._getSaleOrder(clickedOrder.id);
            const currentSaleOrigin = this._getSaleOrderOrigin(currentPOSOrder);
            const currentSaleOriginId = currentSaleOrigin && currentSaleOrigin.id;

            if (currentSaleOriginId) {
                const linkedSO = await this._getSaleOrder(currentSaleOriginId);
                if (
                    getId(linkedSO.partner_id) !== getId(sale_order.partner_id) ||
                    getId(linkedSO.partner_invoice_id) !==
                        getId(sale_order.partner_invoice_id) ||
                    getId(linkedSO.partner_shipping_id) !==
                        getId(sale_order.partner_shipping_id)
                ) {
                    currentPOSOrder = this.env.pos.add_new_order();
                    this.showNotification(this.env._t("A new order has been created."));
                }
            }

            const order_partner = this.env.pos.db.get_partner_by_id(
                sale_order.partner_id[0]
            );
            if (order_partner) {
                currentPOSOrder.set_partner(order_partner);
            } else {
                try {
                    await this.env.pos._loadPartners([sale_order.partner_id[0]]);
                } catch (_error) {
                    const title = this.env._t("Customer loading error");
                    const body = _.str.sprintf(
                        this.env._t("There was a problem in loading the %s customer."),
                        sale_order.partner_id[1]
                    );
                    await this.showPopup("ErrorPopup", {title, body});
                }
                currentPOSOrder.set_partner(
                    this.env.pos.db.get_partner_by_id(sale_order.partner_id[0])
                );
            }

            const orderFiscalPos = sale_order.fiscal_position_id
                ? this.env.pos.fiscal_positions.find(
                      (position) => position.id === sale_order.fiscal_position_id[0]
                  )
                : false;
            if (orderFiscalPos) {
                currentPOSOrder.fiscal_position = orderFiscalPos;
            }
            const orderPricelist = sale_order.pricelist_id
                ? this.env.pos.pricelists.find(
                      (pricelist) => pricelist.id === sale_order.pricelist_id[0]
                  )
                : false;
            if (orderPricelist) {
                currentPOSOrder.set_pricelist(orderPricelist);
            }

            if (this.env.pos.config.down_payment_product_id) {
                const lines = sale_order.order_line;
                const tab = [];

                for (let i = 0; i < lines.length; i++) {
                    tab[i] = {
                        product_name: lines[i].product_id[1],
                        product_uom_qty: lines[i].product_uom_qty,
                        price_unit: lines[i].price_unit,
                        total: lines[i].price_total,
                    };
                }
                let down_payment_product = this.env.pos.db.get_product_by_id(
                    this.env.pos.config.down_payment_product_id[0]
                );
                if (!down_payment_product) {
                    await this.env.pos._addProducts([
                        this.env.pos.config.down_payment_product_id[0],
                    ]);
                    down_payment_product = this.env.pos.db.get_product_by_id(
                        this.env.pos.config.down_payment_product_id[0]
                    );
                }
                const down_payment_tax =
                    this.env.pos.taxes_by_id[down_payment_product.taxes_id] || false;
                let down_payment = 0;
                if (down_payment_tax) {
                    down_payment = down_payment_tax.price_include
                        ? sale_order.amount_total
                        : sale_order.amount_untaxed;
                } else {
                    down_payment = sale_order.amount_total;
                }

                const {confirmed, payload} = await this.showPopup("NumberPopup", {
                    title: sprintf(
                        this.env._t("Fixed amount of %s"),
                        this.env.pos.format_currency(sale_order.amount_total)
                    ),
                    startingValue: 0,
                });
                if (confirmed) {
                    down_payment = parse.float(payload);
                }
                if (down_payment > sale_order.amount_unpaid) {
                    const errorBody = sprintf(
                        this.env._t(
                            "You have tried to charge a down payment of %s but only %s remains to be paid, %s will be applied to the purchase order line."
                        ),
                        this.env.pos.format_currency(down_payment),
                        this.env.pos.format_currency(sale_order.amount_unpaid),
                        sale_order.amount_unpaid > 0
                            ? this.env.pos.format_currency(sale_order.amount_unpaid)
                            : this.env.pos.format_currency(0)
                    );
                    await this.showPopup("ErrorPopup", {
                        title: this.env._t("Error amount too high"),
                        body: errorBody,
                    });
                    down_payment =
                        sale_order.amount_unpaid > 0 ? sale_order.amount_unpaid : 0;
                }
                const new_line = Orderline.create(
                    {},
                    {
                        pos: this.env.pos,
                        order: this.env.pos.get_order(),
                        product: down_payment_product,
                        price: down_payment,
                        price_automatically_set: true,
                        sale_order_origin_id: clickedOrder,
                        down_payment_details: tab,
                    }
                );
                new_line.set_unit_price(down_payment);
                this.env.pos.get_order().add_orderline(new_line);
            } else {
                const title = this.env._t("No down payment product");
                const body = this.env._t(
                    "It seems that you didn't configure a down payment product in your point of sale.\
                    You can go to your point of sale configuration to choose one."
                );
                await this.showPopup("ErrorPopup", {title, body});
            }
            this.close();
            return {confirmed: false, payload: false};
        }
    };

Registries.Component.extend(
    SaleOrderManagementScreen,
    FixAmountSaleOrderManagementScreen
);
