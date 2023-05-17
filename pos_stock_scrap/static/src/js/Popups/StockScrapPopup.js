/*
    Copyright (C) 2023 KMEE (https://kmee.com.br)
    @author: Felipe Zago <felipe.zago@kmee.com.br>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
odoo.define("pos_stock_crap.StockScrapPopup", function (require) {
    "use strict";

    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const Registries = require("point_of_sale.Registries");
    const {useState, onMounted} = owl.hooks;
    const rpc = require("web.rpc");

    class StockScrapPopup extends AbstractAwaitablePopup {
        setup() {
            onMounted(() => {
                $("table").DataTable();

                $(document).on("click", ".scrap-product-table td", (ev) =>
                    this.selectProduct(ev)
                );

                $(document).on("keyup", "[type=search]", function (ev) {
                    if (ev.keyCode === "Enter" || ev.keyCode === 13) {
                        $(ev.target).blur();
                    }
                });
            });

            this.state = useState({});
            this.db = this.env.pos.db;
        }

        get variant_select_id() {
            return "variant_select";
        }

        get reason_code_select_id() {
            return "reason_code_select";
        }

        get templates_list() {
            return Object.entries(this.db.template_by_id).map((templ) => templ[1]);
        }

        get variants_list() {
            const selectedTemplate = this.db.template_by_id[this.state.productId];
            const variant_ids = selectedTemplate.product_variant_ids.map(
                (product_id) => this.db.product_by_id[product_id]
            );

            return _.map(variant_ids, (variant) => {
                return {
                    id: variant.id,
                    label: variant.display_name,
                };
            });
        }

        get reason_codes_list() {
            return _.map(this.db.scrap_reason_code_by_id, (reason) => {
                return {
                    id: reason.id,
                    label: reason.name,
                };
            });
        }

        get selectedVariant() {
            const variantId = this.getSelectValueById(this.variant_select_id);
            if (!variantId) return;

            return this.db.product_by_id[variantId];
        }

        get selectedReasonCode() {
            const reasonCodeId = this.getSelectValueById(this.reason_code_select_id);
            if (!reasonCodeId) return;

            return this.db.scrap_reason_code_by_id[reasonCodeId];
        }

        getSelectValueById(id) {
            const selected = $("#" + id).find(".selected");
            if (selected.length === 0) return;

            return parseInt(selected.attr("value"), 10);
        }

        selectProduct(event) {
            const $target = $(event.currentTarget);
            $("td").removeClass("highlighted");
            $target.addClass("highlighted");

            this.state.productId = $target.attr("value");
        }

        async createStockScrap() {
            if (!this.validateFields()) {
                $(".error-msg").show();
                return;
            }

            await rpc.query({
                model: "stock.scrap",
                method: "create_and_do_scraps",
                args: [this.prepareStockScrapVals()],
            });

            this.cancel();
        }

        validateFields() {
            return (
                this.selectedVariant &&
                this.state.productQty &&
                (Object.keys(this.db.scrap_reason_code_by_id).length
                    ? this.selectedReasonCode !== undefined
                    : true)
            );
        }

        prepareStockScrapVals() {
            return {
                product_id: this.selectedVariant.id,
                product_uom_id: this.selectedVariant.uom_id[0],
                scrap_qty: parseFloat(this.state.productQty),
                reason_code_id: this.selectedReasonCode.id,
                location_id: this.env.pos.config.scrap_location_id[0],
                scrap_location_id: this.env.pos.config.scrap_source_location_id[0],
            };
        }
    }

    StockScrapPopup.template = "StockScrapPopup";
    Registries.Component.add(StockScrapPopup);

    return StockScrapPopup;
});
