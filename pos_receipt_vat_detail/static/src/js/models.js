odoo.define("pos_receipt_vat_detail.models", function (require) {
    "use strict";

    const {Order} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    var core = require("web.core");
    var _t = core._t;

    const OverloadOrder = (OriginalOrder) =>
        class extends OriginalOrder {
            /**
             * * Detailed values for tax lines.
             * @returns {dict} List of taxes description.
             */
            get_tax_details_with_base() {
                var self = this;
                var tax_dict = {};
                var tax_total = 0.0;
                var base_total = 0.0;
                var tax_details = [
                    {
                        base_text: _t("Base"),
                        amount_text: _t("Amount"),
                    },
                ];
                _.each(this.get_orderlines(), function (line) {
                    var line_detail = line.get_all_prices();
                    for (var id in line_detail.taxDetails) {
                        var tax = self.pos.taxes_by_id[id];
                        if (tax.amount in tax_dict) {
                            tax_dict[tax.amount].tax_amount += line_detail.tax;
                            tax_dict[tax.amount].base_amount +=
                                line_detail.priceWithoutTax;
                        } else {
                            tax_dict[tax.amount] = {
                                tax_amount: line_detail.tax,
                                base_amount: line_detail.priceWithoutTax,
                            };
                        }
                    }
                    // Handle case where there is no tax
                    if (line_detail.tax === 0 && line_detail.priceWithTax !== 0) {
                        if (0.0 in tax_dict) {
                            tax_dict[0.0].tax_amount += 0.0;
                            tax_dict[0.0].base_amount += line_detail.priceWithoutTax;
                        } else {
                            tax_dict[0.0] = {
                                tax_amount: 0.0,
                                base_amount: line_detail.priceWithoutTax,
                            };
                        }
                    }
                });
                $.each(tax_dict, function (key, value) {
                    tax_total += value.tax_amount;
                    base_total += value.base_amount;
                    tax_details.push({
                        base_text:
                            _t("Tax") +
                            " " +
                            String(key) +
                            " % " +
                            _t("Over") +
                            " " +
                            self.pos.format_currency(value.base_amount),
                        amount_text: self.pos.format_currency(value.tax_amount),
                    });
                });
                if (tax_details.length > 2) {
                    tax_details.push({
                        base_text:
                            _t("Total") + " " + self.pos.format_currency(base_total),
                        amount_text: self.pos.format_currency(tax_total),
                    });
                }
                return tax_details;
            }

            export_for_printing() {
                var receipt = super.export_for_printing(...arguments);
                receipt.tax_details_with_base = this.get_tax_details_with_base();
                return receipt;
            }
        };

    Registries.Model.extend(Order, OverloadOrder);

    return Order;
});
