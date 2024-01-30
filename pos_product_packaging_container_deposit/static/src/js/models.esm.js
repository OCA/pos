odoo.define("pos_product_packaging_container_deposit.models", function (require) {
    const {Order, Orderline} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const DepositOrder = (Order) =>
        class DepositOrder extends Order {
            _getDepositQty(qty, packaging_qty) {
                if (!packaging_qty || this.pos.isProductQtyZero(packaging_qty))
                    return 0;
                return this.pos.formatProductQty(parseInt(qty / packaging_qty));
            }
        };
    Registries.Model.extend(Order, DepositOrder);

    const DepositOrderline = (Orderline) =>
        class DepositOrderline extends Orderline {
            constructor(obj, options) {
                super(...arguments);
                this.container_deposit_line_id =
                    this.container_deposit_line_id || options.container_deposit_line_id;
                this.is_container_deposit =
                    this.is_container_deposit || options.is_container_deposit;
                this.deposit_packaging_qty =
                    this.deposit_packaging_qty || options.deposit_packaging_qty;
            }
            init_from_JSON(json) {
                super.init_from_JSON(...arguments);
                this.container_deposit_line_id = json.container_deposit_line_id;
                this.is_container_deposit = json.is_container_deposit;
                this.deposit_packaging_qty = json.deposit_packaging_qty;
            }
            export_as_JSON() {
                const json = super.export_as_JSON(...arguments);
                json.container_deposit_line_id = this.container_deposit_line_id;
                json.is_container_deposit = this.is_container_deposit;
                json.deposit_packaging_qty = this.deposit_packaging_qty;
                return json;
            }
            set_quantity(quantity, keep_price) {
                // eslint-disable-line no-unused-vars
                const resp = super.set_quantity(quantity, keep_price);
                if (!resp || !this.container_deposit_line_id) return resp;

                const depositLine = this.order.get_orderline(
                    this.container_deposit_line_id
                );
                if (!depositLine || !depositLine.deposit_packaging_qty) {
                    this.container_deposit_line_id = null;
                    return resp;
                }

                if (quantity === "remove") {
                    // Remove deposit line as well
                    this.order.remove_orderline(depositLine);
                } else {
                    const qty = this.get_quantity();
                    const deposit_qty = this.order._getDepositQty(
                        qty,
                        depositLine.deposit_packaging_qty
                    );
                    depositLine.set_quantity(deposit_qty);
                }
                return resp;
            }
        };
    Registries.Model.extend(Orderline, DepositOrderline);
});
