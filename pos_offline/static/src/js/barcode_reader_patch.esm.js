/** @odoo-module */
/* global console */

import {BarcodeParser} from "@barcodes/js/barcode_parser";
import {patch} from "@web/core/utils/patch";

/**
 * Patch BarcodeParser.fetchNomenclature to gracefully handle network errors.
 * Without this, the barcode_reader_service blocks POS startup when offline
 * because fetchNomenclature does orm.read which throws ConnectionLostError.
 */
patch(BarcodeParser, {
    async fetchNomenclature(orm, id) {
        try {
            return await super.fetchNomenclature(orm, id);
        } catch (error) {
            console.warn(
                "[POS Offline] Failed to fetch barcode nomenclature, barcode scanning disabled:",
                error.message
            );
            // Return a minimal nomenclature so the service can still start
            return {
                id: id,
                name: "Offline (cached)",
                upc_ean_conv: "none",
                rules: [],
            };
        }
    },
});
