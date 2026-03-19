/** @odoo-module */

import IndexedDB from "@point_of_sale/app/models/utils/indexed_db";
import {PosData} from "@point_of_sale/app/models/data_service";
import {patch} from "@web/core/utils/patch";

/**
 * Patch PosData to add custom IndexedDB stores for offline support.
 *
 * We override initIndexedDB() rather than databaseTable because our
 * stores (_pos_load_data_cache, _pending_orders) are not ORM models
 * and should not participate in the syncDataWithIndexedDB cycle.
 */

// Bump the IndexedDB version to trigger onupgradeneeded and create new stores
const OFFLINE_DB_VERSION = 2;

patch(PosData.prototype, {
    initIndexedDB() {
        // Get the standard model stores from databaseTable
        const models = Object.entries(this.opts.databaseTable).map(([name, data]) => [
            data.key,
            name,
        ]);

        // Add custom stores for offline support
        models.push(["config_id", "_pos_load_data_cache"]);
        models.push(["uuid", "_pending_orders"]);

        this.indexedDB = new IndexedDB(this.databaseName, OFFLINE_DB_VERSION, models);
    },
});
