/** @odoo-module */
/* global navigator, console, window */

import {ConnectionLostError} from "@web/core/network/rpc";
import {PosData} from "@point_of_sale/app/models/data_service";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

const LOAD_DATA_CACHE_STORE = "_pos_load_data_cache";

patch(PosData.prototype, {
    /**
     * Override loadInitialData to:
     * 1. On success: cache the response in IndexedDB for offline use
     * 2. On network error: fall back to cached data from IndexedDB
     *
     * We call orm.call directly instead of super to intercept network
     * errors BEFORE the core's catch block shows a blocking alert.
     */
    async loadInitialData() {
        try {
            const response = await this.orm.call("pos.session", "load_data", [
                odoo.pos_session_id,
                PosData.modelToLoad,
            ]);
            if (response) {
                this._cacheLoadData(response);
            }
            return response;
        } catch (error) {
            // Check if this is a network error (offline scenario)
            if (
                error instanceof ConnectionLostError ||
                !navigator.onLine ||
                this._isNetworkError(error)
            ) {
                console.warn(
                    "[POS Offline] Network error during loadInitialData, trying cache..."
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
                return undefined;
            }
            // Non-network error: fall back to super behavior (shows alert)
            return super.loadInitialData();
        }
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

    /**
     * Check if an error is a network-related error beyond ConnectionLostError.
     */
    _isNetworkError(error) {
        if (!error) {
            return false;
        }
        var msg = error.message || "";
        return (
            msg.includes("Failed to fetch") ||
            msg.includes("Load failed") ||
            msg.includes("NetworkError") ||
            msg.includes("Network request failed") ||
            msg.includes("ERR_INTERNET_DISCONNECTED")
        );
    },
});
