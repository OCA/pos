/* Copyright 2024 Hunki Enterprises BV
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */
odoo.define("pos_container_deposit.models", function (require) {
    "use strict";

    const {Order, Orderline} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");
    const {Gui} = require("point_of_sale.Gui");
    const core = require("web.core");
    const _t = core._t;

    const PosDepositOrderExtension = (Order) =>
        class PosDepositOrder extends Order {
            add_product(product) {
                /**
                 * Show an error message when adding a product with a container deposit product that is not loaded
                 **/
                var deposit = null;
                if (product.deposit_product_id) {
                    deposit = this.pos.db.product_by_id[product.deposit_product_id[0]];
                    if (!deposit) {
                        Gui.showPopup("ErrorPopup", {
                            title: _t("Deposit not available"),
                            body: _.str.sprintf(
                                _t(
                                    "The product %s is configured as having a deposit but the deposit product %s is not available in POS."
                                ),
                                product.display_name,
                                product.deposit_product_id[1]
                            ),
                        });
                        return false;
                    }
                }
                super.add_product(...arguments);
            }
            add_orderline(line) {
                /**
                 * When adding a product with container deposit, add its container deposit product
                 **/
                super.add_orderline(...arguments);
                // Get unpayed orders orders from db.pos
                const all_unpaid = this.pos.get_order_list().map((x) => x.cid);
                const is_unpaid = all_unpaid.includes(line.order.cid);
                if (
                    line.container_deposit_product &&
                    !line.container_deposit_line &&
                    is_unpaid
                ) {
                    this.add_product(line.container_deposit_product, {
                        quantity: line.get_quantity(),
                    });
                    line.container_deposit_line = this.get_last_orderline();
                    line.container_deposit_line.is_container_deposit = true;
                    this.select_orderline(line);
                }
            }
            select_orderline(line) {
                /**
                 * Never select an orderline with deposit, select one next to it instead
                 **/
                if (line && line.is_container_deposit) {
                    const line_index = this.orderlines.indexOf(line);
                    if (line_index >= 0 && this.orderlines.length > 1) {
                        super.select_orderline(
                            this.orderlines[line_index ? line_index - 1 : 0]
                        );
                    }
                } else {
                    super.select_orderline(...arguments);
                }
            }
        };

    const PosDepositOrderlineExtension = (Orderline) =>
        class PosDepositOrderLine extends Orderline {
            constructor() {
                /**
                 * Set container deposit specific properties
                 **/
                super(...arguments);
                const deposit_product = this.product
                    ? this.pos.db.get_product_by_id(this.product.id).deposit_product_id
                    : null;
                if (deposit_product) {
                    this.container_deposit_product = this.pos.db.get_product_by_id(
                        deposit_product[0]
                    );
                }
            }
            init_from_JSON(json) {
                /**
                 * Restore container deposit specific properties and link between line with deposit and deposit line
                 **/
                super.init_from_JSON(json);
                if (json.container_deposit_line_id) {
                    this.container_deposit_line =
                        this.order.get_orderline(json.container_deposit_line_id) ||
                        json.container_deposit_line_id;
                }
                if (json.is_container_deposit) {
                    for (var i = 0; i < this.order.orderlines.length; i++) {
                        if (
                            this.order.orderlines[i].container_deposit_line === this.id
                        ) {
                            this.order.orderlines[i].container_deposit_line = this;
                            break;
                        }
                    }
                    this.is_container_deposit = true;
                }
            }
            export_as_JSON() {
                /**
                 * Export deposit line as id
                 **/
                const result = super.export_as_JSON();
                result.is_container_deposit = this.is_container_deposit;
                if (this.container_deposit_line) {
                    result.container_deposit_line_id = this.container_deposit_line.id;
                }
                return result;
            }
            set_quantity(quantity, keep_price) {
                /**
                 * When setting quantity of a product with deposit, also add to its deposit line
                 **/
                const difference =
                    quantity === "remove" ? -this.quantity : quantity - this.quantity;
                const deposit_line = this.container_deposit_line;
                const result = super.set_quantity(...arguments);
                if ((difference || quantity === "remove") && deposit_line) {
                    var deposit_quantity = deposit_line.quantity + difference;
                    deposit_line.set_quantity(
                        deposit_quantity
                            ? deposit_quantity
                            : quantity === "remove"
                            ? quantity
                            : deposit_quantity,
                        keep_price
                    );
                }
                return result;
            }
            can_be_merged_with(orderline) {
                /**
                 * Never merge deposit orderlines
                 **/
                if (this.is_container_deposit || orderline.is_container_deposit) {
                    return false;
                }
                return super.can_be_merged_with(...arguments);
            }
        };

    Registries.Model.extend(Order, PosDepositOrderExtension);
    Registries.Model.extend(Orderline, PosDepositOrderlineExtension);
});
