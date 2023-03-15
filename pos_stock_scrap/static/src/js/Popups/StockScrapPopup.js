/*
    Copyright (C) 2016-Today KMEE (https://kmee.com.br)
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

                const self = this;
                $(document).on("click", ".scrap-product-table td", (ev) =>
                    self._selectProduct(ev)
                );

                $(document).on("keyup", "[type=search]", function (ev) {
                    if (ev.keyCode === "Enter" || ev.keyCode === 13) {
                        $(ev.target).blur();
                    }
                });
            });

            this.state = useState({});
            this.product_by_id = this.env.pos.db.product_by_id;
            this.template_by_id = this.env.pos.db.template_by_id;
        }

        _selectProduct(event) {
            const $target = $(event.currentTarget);
            $("td").removeClass("highlighted");
            $target.addClass("highlighted");

            this.state.productId = $target.attr("value");
        }

        get templates() {
            return Object.entries(this.template_by_id).map((a) => a[1]);
        }

        get selectedTemplate() {
            return this.templates.find(
                (value) => value.id === parseInt(this.state.productId)
            );
        }

        get variants() {
            return this.selectedTemplate.product_variant_ids.map(
                (a) => this.product_by_id[a]
            );
        }

        get selectedVariant() {
            return this.product_by_id[$("#variantId").val()];
        }

        validateFields() {
            return (
                this.selectedVariant &&
                this.state.productQty &&
                (this.env.pos.scrap_reason_codes.length
                    ? this.state.scrapReasonId !== undefined
                    : true)
            );
        }

        prepareStockScrapVals() {
            return {
                product_id: this.selectedVariant.id,
                product_uom_id: this.selectedVariant.uom_id[0],
                scrap_qty: parseFloat(this.state.productQty),
                reason_code_id: parseInt(this.state.scrapReasonId),
                location_id: this.env.pos.config.scrap_location_id[0],
                scrap_location_id: this.env.pos.config.scrap_source_location_id[0],
            };
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
    }

    StockScrapPopup.template = "StockScrapPopup";
    Registries.Component.add(StockScrapPopup);

    return StockScrapPopup;
});
