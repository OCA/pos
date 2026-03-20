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
 *
 * We also override loadIndexedDBData() to strip custom stores from
 * the data before it reaches missingRecursive/loadData — otherwise
 * those functions try to process our stores as ORM models and crash.
 */

// Bump the IndexedDB version to trigger onupgradeneeded and create new stores
const OFFLINE_DB_VERSION = 2;

// Store names that are NOT ORM models — must be stripped from readAll() results
const CUSTOM_STORES = new Set(["_pos_load_data_cache", "_pending_orders"]);

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

    async loadIndexedDBData() {
        const data = await this.indexedDB.readAll();

        if (!data) {
            return;
        }

        // Strip custom stores before processing — they are not ORM models
        // and would crash missingRecursive/loadData
        for (const key of CUSTOM_STORES) {
            delete data[key];
        }

        // Now delegate to the original logic with clean data
        // We must inline the rest of super.loadIndexedDBData() because
        // it already called readAll() and we can't re-call super (it would
        // readAll again without our cleanup).
        const newData = {};
        for (const model of Object.keys(this.opts.databaseTable)) {
            const rawRec = data[model];
            if (rawRec) {
                newData[model] = rawRec.filter((r) => !this.models[model].get(r.id));
            }
        }

        if (data["product.product"]) {
            data["product.product"] = data["product.product"].filter(
                (p) => !this.models["product.product"].get(p.id)
            );
        }

        const preLoadData = await this.preLoadData(data);
        const missing = await this.missingRecursive(preLoadData);
        const results = this.models.loadData(missing, [], true, true);
        for (const [modelName, records] of Object.entries(results)) {
            for (const record of records) {
                if (record.raw.JSONuiState) {
                    const loadedRecords = this.models[modelName].find(
                        (r) => r.uuid === record.uuid
                    );
                    if (loadedRecords) {
                        loadedRecords.setupState(JSON.parse(record.raw.JSONuiState));
                    }
                }
            }
        }

        return results;
    },
});
