/*
    Copyright 2022 Camptocamp SA
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
*/
odoo.define("pos_lot_base.db", function (require) {
    "use strict";

    const PosDB = require("point_of_sale.DB");

    PosDB.include({
        init: function () {
            this._super.apply(this, arguments);
            this.lot_by_id = {};
            this.lot_id_by_barcode = {};
            this.product_id_by_lot_id = {};
        },
        add_lots: function (lots) {
            if (!lots instanceof Array) {
                lots = [lots];
            }
            for (const lot of lots) {
                if (this.lot_by_id[lot.id]) {
                    Object.assign(this.lot_by_id[lot.id], lot);
                } else {
                    this.lot_by_id[lot.id] = lot;
                    if (!this.product_id_by_lot_id[lot.id]) {
                        this.product_id_by_lot_id[lot.id] = lot.product_id[0];
                    }
                    // Handle lots with similar name and different product ID
                    if (!this.lot_id_by_barcode[lot.name]) {
                        // If we don't already have a similar barcode assign actual lot ID
                        this.lot_id_by_barcode[lot.name] = lot.id;
                    } else {
                        const existing_lot_id = this.lot_id_by_barcode[lot.name];
                        if (!(existing_lot_id instanceof Array)) {
                            // If we already have an existing lot ID, check if product is different
                            const existing_lot_product_id =
                                this.product_id_by_lot_id[existing_lot_id];
                            if (existing_lot_product_id !== lot.product_id[0]) {
                                // In such case, add both lot IDs into an array
                                this.lot_id_by_barcode[lot.name] = [
                                    existing_lot_id,
                                    lot.id,
                                ];
                            }
                        } else {
                            // If we already have multiple lot IDs for this barcode, add the new lot ID
                            existing_lot_id.push(lot.id);
                        }
                    }
                }
            }
        },
        get_product_by_lot_barcode: function (barcode) {
            const lot_id = this.lot_id_by_barcode[barcode];
            if (lot_id instanceof Array) {
                // If lot_id is an Array we have multiple product matching
                return {
                    single_lot: false,
                    product: _.map(lot_id, (id) => this.get_product_by_lot_id(id)),
                };
            }
            return {
                single_lot: true,
                product: this.get_product_by_lot_id(lot_id),
            };
        },
        get_product_by_lot_id: function (id) {
            const product_id = this.product_id_by_lot_id[id];
            if (product_id) {
                return this.get_product_by_id(this.product_id_by_lot_id[id]);
            }
            return undefined;
        },
    });
    return PosDB;
});
