/** @odoo-module */
/* global navigator, console, window */

import {PosData} from "@point_of_sale/app/models/data_service";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

const LOAD_DATA_CACHE_STORE = "_pos_load_data_cache";

patch(PosData.prototype, {
    /**
     * Override loadInitialData to:
     * 1. Cache the response in IndexedDB on success
     * 2. Fall back to cached data when offline
     *
     * Calls super.loadInitialData() to preserve compatibility with other patches.
     * The super returns undefined on error (after showing alert). We intercept
     * ConnectionLostError before it reaches super's catch by wrapping the call.
     */
    async loadInitialData() {
        // First, try super (which calls orm.call and shows alert on error)
        const response = await super.loadInitialData();

        if (response) {
            // Success: cache for offline use
            await this._cacheLoadData(response);
            return response;
        }

        // Super returned undefined — either an error occurred or data was empty.
        // Check if we're offline and can use cache.
        if (!navigator.onLine || this.network.offline) {
            console.warn(
                "[POS Offline] loadInitialData returned empty, trying cache..."
            );
            const cached = await this._getCachedLoadData();
            if (cached) {
                this.network.offline = true;
                console.info("[POS Offline] Loaded data from IndexedDB cache");
                return cached.data;
            }
            window.alert(
                _t(
                    "You are offline and no cached data is available. " +
                        "Please open the POS online at least once to enable offline mode."
                )
            );
        }

        return response;
    },

    /**
     * Cache the load_data response in IndexedDB.
     * @param {Object} response - The full load_data response
     */
    async _cacheLoadData(response) {
        try {
            const cacheEntry = {
                config_id: odoo.pos_config_id,
                data: response,
                timestamp: new Date().toISOString(),
                session_id: odoo.pos_session_id,
            };
            await this.indexedDB.create(LOAD_DATA_CACHE_STORE, [cacheEntry]);
            console.info(
                "[POS Offline] Cached load_data for config",
                odoo.pos_config_id
            );
        } catch (error) {
            console.warn("[POS Offline] Failed to cache load_data:", error);
        }
    },

    /**
     * Retrieve cached load_data from IndexedDB.
     * @returns {Object|null} The cached entry or null
     */
    async _getCachedLoadData() {
        try {
            const data = await this.indexedDB.readAll([LOAD_DATA_CACHE_STORE]);
            if (data && data[LOAD_DATA_CACHE_STORE]) {
                const entries = data[LOAD_DATA_CACHE_STORE];
                const entry = entries.find((e) => e.config_id === odoo.pos_config_id);
                if (entry) {
                    console.info(
                        "[POS Offline] Found cached data from",
                        entry.timestamp
                    );
                    return entry;
                }
            }
            return null;
        } catch (error) {
            console.warn("[POS Offline] Failed to read cached load_data:", error);
            return null;
        }
    },
});
