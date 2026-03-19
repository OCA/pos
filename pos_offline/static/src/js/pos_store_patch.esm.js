/** @odoo-module */
/* global console, navigator, setTimeout, setInterval, clearInterval */

import {ConnectionLostError} from "@web/core/network/rpc";
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";

const PENDING_ORDERS_STORE = "_pending_orders";

// Retry configuration
const RETRY_INITIAL_DELAY = 1000;
const RETRY_MAX_DELAY = 60000;
const RETRY_CHECK_INTERVAL = 30000;

patch(PosStore.prototype, {
    async setup(env, services) {
        await super.setup(env, services);

        // Restore pending orders from IndexedDB on startup
        await this._restorePendingOrdersFromDB();

        // Setup periodic sync check as safety net
        this._retryDelay = RETRY_INITIAL_DELAY;
        this._retryTimer = null;
        this._syncCheckIntervalId = null;
        this._setupPeriodicSyncCheck();
    },

    // ===== Pending Orders Persistence =====

    addPendingOrder(orderIds, remove = false) {
        const result = super.addPendingOrder(orderIds, remove);
        this._persistPendingOrdersToDB();
        return result;
    },

    removePendingOrder(order) {
        const result = super.removePendingOrder(order);
        this._persistPendingOrdersToDB();
        return result;
    },

    clearPendingOrder() {
        super.clearPendingOrder();
        this._persistPendingOrdersToDB();
    },

    /**
     * Persist the current pending order Sets to IndexedDB.
     */
    async _persistPendingOrdersToDB() {
        try {
            const entry = {
                uuid: "pending_orders_state",
                create: [...this.pendingOrder.create],
                write: [...this.pendingOrder.write],
                delete_ids: [...this.pendingOrder.delete],
                timestamp: new Date().toISOString(),
            };
            await this.data.indexedDB.create(PENDING_ORDERS_STORE, [entry]);
        } catch (error) {
            console.warn("[POS Offline] Failed to persist pending orders:", error);
        }
    },

    /**
     * Restore pending order Sets from IndexedDB on startup.
     */
    async _restorePendingOrdersFromDB() {
        try {
            const data = await this.data.indexedDB.readAll([PENDING_ORDERS_STORE]);
            if (data && data[PENDING_ORDERS_STORE]) {
                const entries = data[PENDING_ORDERS_STORE];
                const entry = entries.find((e) => e.uuid === "pending_orders_state");
                if (entry) {
                    // Merge with any existing pending orders (don't overwrite)
                    for (const id of entry.create || []) {
                        this.pendingOrder.create.add(id);
                    }
                    for (const id of entry.write || []) {
                        this.pendingOrder.write.add(id);
                    }
                    for (const id of entry.delete_ids || []) {
                        this.pendingOrder.delete.add(id);
                    }
                    const totalPending =
                        this.pendingOrder.create.size +
                        this.pendingOrder.write.size +
                        this.pendingOrder.delete.size;
                    if (totalPending > 0) {
                        console.info(
                            `[POS Offline] Restored ${totalPending} pending order operations from IndexedDB`
                        );
                    }
                }
            }
        } catch (error) {
            console.warn("[POS Offline] Failed to restore pending orders:", error);
        }
    },

    // ===== Sync with Retry =====

    async syncAllOrders(options = {}) {
        try {
            const result = await super.syncAllOrders(options);
            // Reset retry delay on success
            this._retryDelay = RETRY_INITIAL_DELAY;
            return result;
        } catch (error) {
            if (error instanceof ConnectionLostError) {
                this._scheduleRetrySync();
            }
            throw error;
        }
    },

    /**
     * Schedule a retry sync with exponential backoff.
     * Delay progression: 1s → 2s → 4s → 8s → 16s → 32s → 60s (max)
     */
    _scheduleRetrySync() {
        if (this._retryTimer) {
            return; // Already scheduled
        }

        const currentDelay = this._retryDelay;
        // Bump delay for next call BEFORE scheduling, so recursive calls use the new value
        this._retryDelay = Math.min(this._retryDelay * 2, RETRY_MAX_DELAY);

        console.info(`[POS Offline] Scheduling sync retry in ${currentDelay / 1000}s`);

        this._retryTimer = setTimeout(async () => {
            this._retryTimer = null;

            const hasPending =
                this.pendingOrder.create.size > 0 || this.pendingOrder.write.size > 0;

            if (hasPending && navigator.onLine) {
                try {
                    await this.syncAllOrders();
                } catch (e) {
                    // SyncAllOrders catch will call _scheduleRetrySync again
                    console.warn("[POS Offline] Retry sync failed:", e.message);
                }
            } else if (hasPending) {
                // Still offline, schedule another retry
                this._scheduleRetrySync();
            }
        }, currentDelay);
    },

    /**
     * Setup periodic check for unsync'd orders as a safety net.
     * Stores the interval ID so it can be cleaned up if needed.
     */
    _setupPeriodicSyncCheck() {
        if (this._syncCheckIntervalId) {
            clearInterval(this._syncCheckIntervalId);
        }
        this._syncCheckIntervalId = setInterval(async () => {
            const hasPending =
                this.pendingOrder.create.size > 0 || this.pendingOrder.write.size > 0;

            if (hasPending && navigator.onLine && !this.data.network.offline) {
                console.info("[POS Offline] Periodic check: syncing pending orders...");
                try {
                    await this.syncAllOrders();
                } catch {
                    // Silently ignore, retry will handle it
                }
            }
        }, RETRY_CHECK_INTERVAL);
    },

    // ===== Session Close Guard =====

    /**
     * Check if there are pending orders that need to be synced before closing.
     */
    hasPendingOrdersToSync() {
        return (
            this.pendingOrder.create.size > 0 ||
            this.pendingOrder.write.size > 0 ||
            this.pendingOrder.delete.size > 0
        );
    },
});
