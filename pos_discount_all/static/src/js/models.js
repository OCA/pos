/*
    Copyright (C) 2022-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

odoo.define("pos_discount_all.models", function (require) {
    "use strict";

    const {Order, Orderline} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");
    const {round_precision: round_pr} = require("web.utils");

    // eslint-disable-next-line no-shadow
    const PosDiscountAllOrder = (Order) =>
        // eslint-disable-next-line no-shadow
        class PosDiscountAllOrder extends Order {
            // eslint-disable-line no-shadow
            // @override
            _get_ignored_product_ids_total_discount() {
                const productIds = super._get_ignored_product_ids_total_discount(
                    ...arguments
                );
                _.map(this.pos.db.product_by_id, function (product) {
                    if (product.is_discount) {
                        productIds.push(product.id);
                    }
                });
                return productIds;
            }

            get_total_with_tax_without_any_discount() {
                return round_pr(
                    this.orderlines.reduce(function (sum, orderLine) {
                        return (
                            sum +
                            orderLine.get_total_without_any_discount().total_included
                        );
                    }, 0),
                    this.pos.currency.rounding
                );
            }

            get_discount_amount_with_tax_without_any_discount() {
                return round_pr(
                    this.get_total_with_tax_without_any_discount() -
                        this.get_total_with_tax(),
                    this.pos.currency.rounding
                );
            }

            export_for_printing() {
                var receipt = super.export_for_printing(...arguments);
                receipt.total_discount =
                    this.get_discount_amount_with_tax_without_any_discount();
                return receipt;
            }
        };

    Registries.Model.extend(Order, PosDiscountAllOrder);

    // eslint-disable-next-line no-shadow
    const PosDiscountAllOrderLine = (Orderline) =>
        // eslint-disable-next-line no-shadow
        class PosDiscountAllOrderLine extends Orderline {
            // eslint-disable-line no-shadow
            get_total_without_any_discount() {
                var product = this.get_product();
                const ignored_product_ids =
                    this.order._get_ignored_product_ids_total_discount();
                if (ignored_product_ids.includes(product.id)) {
                    return {
                        total_excluded: 0.0,
                        total_included: 0.0,
                    };
                }
                var price_unit_without_any_discount = product.get_price(
                    this.pos.default_pricelist,
                    this.get_quantity()
                );
                var taxes_ids = this.tax_ids || product.taxes_id;
                taxes_ids = _.filter(taxes_ids, (t) => t in this.pos.taxes_by_id);
                var product_taxes = this.pos.get_taxes_after_fp(
                    taxes_ids,
                    this.order.fiscal_position
                );
                var all_taxes_without_any_discount = this.compute_all(
                    product_taxes,
                    price_unit_without_any_discount,
                    this.get_quantity(),
                    this.pos.currency.rounding
                );
                return {
                    total_excluded: all_taxes_without_any_discount.total_excluded,
                    total_included: all_taxes_without_any_discount.total_included,
                };
            }
        };

    Registries.Model.extend(Orderline, PosDiscountAllOrderLine);
});
