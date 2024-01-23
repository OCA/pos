odoo.define("pos_sale_product_config_no_variant.Orderline", function (require) {
    "use strict";

    const {Order, Orderline} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const PosNoVariantOrderline = (Orderline) =>
        class PosNoVariantOrderline extends Orderline {
            constructor(obj, options) {
                super(...arguments);
                this.product_no_variant_attribute_value_ids =
                    options.product_no_variant_attribute_value_ids || [];
            }
            export_as_JSON() {
                const result = super.export_as_JSON(...arguments);
                result.product_no_variant_attribute_value_ids = _.map(
                    this.product_no_variant_attribute_value_ids,
                    (value) => parseInt(value)
                );
                return result;
            }
            init_from_JSON(json) {
                if (json.product_no_variant_attribute_value_ids) {
                    this.product_no_variant_attribute_value_ids =
                        json.product_no_variant_attribute_value_ids &&
                        json.product_no_variant_attribute_value_ids.length !== 0
                            ? json.product_no_variant_attribute_value_ids[0][2]
                            : undefined;
                }
                super.init_from_JSON(...arguments);
            }
        };
    Registries.Model.extend(Orderline, PosNoVariantOrderline);

    const PosNoVariantOrder = (Order) =>
        class PosNoVariantOrder extends Order {
            constructor() {
                super(...arguments);
            }
            set_orderline_options(line, options) {
                super.set_orderline_options(...arguments);
                if (options && options.product_no_variant_attribute_value_ids) {
                    line.product_no_variant_attribute_value_ids =
                        options.product_no_variant_attribute_value_ids;
                }
            }
        };

    Registries.Model.extend(Order, PosNoVariantOrder);
});
