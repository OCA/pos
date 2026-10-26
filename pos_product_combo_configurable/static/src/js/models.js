/* Copyright 2026 Acysos S.L.
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
 */

odoo.define("pos_product_combo_configurable.models", function (require) {
    "use strict";

    const {PosGlobalState, Order, Orderline} = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const PosComboGlobalState = (PosGlobalState) =>
        class PosComboGlobalState extends PosGlobalState {
            async _processData(loadedData) {
                await super._processData(...arguments);
                this.combo_packs = loadedData["product.combo.pack"] || [];
                this.combo_pack_by_id = {};
                for (const pack of this.combo_packs) {
                    this.combo_pack_by_id[pack.id] = pack;
                }
            }
        };
    Registries.Model.extend(PosGlobalState, PosComboGlobalState);

    const PosComboOrder = (Order) =>
        class PosComboOrder extends Order {
            set_pricelist(pricelist) {
                super.set_pricelist(pricelist);
                for (const line of this.get_orderlines()) {
                    if (
                        line.product &&
                        line.product.is_combo &&
                        line.combo_prod_info &&
                        line.combo_prod_info.length
                    ) {
                        line.update_combo_price();
                    }
                }
            }

            set_orderline_options(orderline, options) {
                super.set_orderline_options(...arguments);
                if (options && options.combo_prod_info) {
                    orderline.set_combo_prod_info(options.combo_prod_info);
                    orderline.set_combo_extra_price(options.combo_extra_price || 0.0);
                    orderline.update_combo_price();
                }
            }
        };
    Registries.Model.extend(Order, PosComboOrder);

    const PosComboOrderline = (Orderline) =>
        class PosComboOrderline extends Orderline {
            constructor(obj, options) {
                super(obj, options);
                this.combo_prod_info = this.combo_prod_info || [];
                this.combo_extra_price = this.combo_extra_price || 0.0;
            }

            set_combo_prod_info(combo_prod_info) {
                this.combo_prod_info = combo_prod_info || [];
            }

            get_combo_prod_info() {
                return this.combo_prod_info || [];
            }

            get_required_combo_products() {
                return (this.combo_prod_info || []).filter((item) => item.is_required);
            }

            get_optional_combo_products() {
                return (this.combo_prod_info || []).filter((item) => !item.is_required);
            }

            set_combo_extra_price(extra_price) {
                this.combo_extra_price = parseFloat(extra_price) || 0.0;
                this.set_price_extra(this.combo_extra_price);
            }

            get_combo_extra_price() {
                return this.combo_extra_price || 0.0;
            }

            update_combo_price() {
                if (!this.order || !this.product) {
                    return;
                }
                const base_price = this.product.get_price(
                    this.order.pricelist,
                    this.get_quantity(),
                    0
                );
                const extra = this.combo_extra_price || 0.0;
                this.set_price_extra(extra);
                this.set_unit_price(base_price + extra);
                this.order.fix_tax_included_price(this);
            }

            set_quantity(quantity, keep_price) {
                const res = super.set_quantity(quantity, keep_price);
                if (
                    quantity !== "remove" &&
                    this.product &&
                    this.product.is_combo &&
                    this.combo_prod_info &&
                    this.combo_prod_info.length &&
                    !keep_price &&
                    !(this.price_manually_set || this.price_automatically_set)
                ) {
                    this.update_combo_price();
                }
                return res;
            }

            can_be_merged_with(orderline) {
                if (
                    (this.product && this.product.is_combo) ||
                    (orderline.get_product() && orderline.get_product().is_combo)
                ) {
                    return false;
                }
                return super.can_be_merged_with(orderline);
            }

            clone() {
                const orderline = super.clone(...arguments);
                orderline.combo_prod_info = JSON.parse(
                    JSON.stringify(this.combo_prod_info || [])
                );
                orderline.combo_extra_price = this.combo_extra_price || 0.0;
                return orderline;
            }

            init_from_JSON(json) {
                super.init_from_JSON(json);
                this.combo_prod_info = json.combo_prod_info || [];
                this.combo_extra_price = json.combo_extra_price || 0.0;
            }

            export_as_JSON() {
                const json = super.export_as_JSON(...arguments);
                json.combo_prod_info = this.combo_prod_info || [];
                json.combo_extra_price = this.combo_extra_price || 0.0;
                return json;
            }

            export_for_printing() {
                const res = super.export_for_printing(...arguments);
                res.is_combo = Boolean(
                    this.product &&
                        this.product.is_combo &&
                        this.combo_prod_info &&
                        this.combo_prod_info.length
                );
                res.combo_prod_info = this.combo_prod_info || [];
                res.combo_extra_price = this.combo_extra_price || 0.0;
                res.combo_base_price = Math.max(
                    0,
                    this.get_unit_display_price() - (this.combo_extra_price || 0.0)
                );
                return res;
            }
        };
    Registries.Model.extend(Orderline, PosComboOrderline);
});
