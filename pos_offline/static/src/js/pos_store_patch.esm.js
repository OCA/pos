/** @odoo-module */
/* global console, navigator, window, setTimeout, setInterval, clearInterval */

import {ConnectionLostError} from "@web/core/network/rpc";
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {patch} from "@web/core/utils/patch";

const PENDING_ORDERS_STORE = "_pending_orders";

// Retry configuration
const RETRY_INITIAL_DELAY = 1000;
const RETRY_MAX_DELAY = 60000;
const RETRY_CHECK_INTERVAL = 10000;

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

        // Listen for online event to sync pending orders and reset offline flag
        window.addEventListener("online", () => {
            console.info(
                "[POS Offline] Online event detected, syncing pending orders..."
            );
            this.data.network.offline = false;
            this.data.network.warningTriggered = false;
            if (this.hasPendingOrdersToSync()) {
                this.syncAllOrders();
            }
        });
    },

    // ===== Offline-safe afterProcessServerData =====

    async afterProcessServerData() {
        if (this.data.network.offline) {
            // Run local-only logic from super (skip network calls)
            // 1. Add paid unsynced orders to pending set
            const paidUnsyncedOrderIds = this.models["pos.order"]
                .filter((order) => order.isUnsyncedPaid)
                .map((order) => order.id);
            if (paidUnsyncedOrderIds.length > 0) {
                this.addPendingOrder(paidUnsyncedOrderIds);
            }

            // 2. Mark residual orders as cancelled
            this.data.models["pos.order"]
                .filter((order) => order._isResidual)
                .forEach((order) => {
                    order.state = "cancel";
                });

            // 3. Select or create order
            const openOrders = this.data.models["pos.order"].filter(
                (order) => !order.finalized
            );
            if (!this.config.module_pos_restaurant) {
                this.selectedOrderUuid = openOrders.length
                    ? openOrders[0].uuid
                    : this.add_new_order().uuid;
            }

            // 4. Mark ready and show screen (skip syncAllOrders, readDataFromServer)
            this.markReady();
            this.showScreen(this.firstScreen);
            return;
        }
        return super.afterProcessServerData();
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
        var result = undefined;
        try {
            result = await super.syncAllOrders(options);
        } catch (error) {
            if (error instanceof ConnectionLostError) {
                this._scheduleRetrySync();
            }
            throw error;
        }

        // Super.syncAllOrders catches ConnectionLostError internally and
        // just logs a warning — it does NOT re-throw. So we check if there
        // are still pending orders after sync returns, and schedule retry.
        var stillPending =
            this.pendingOrder.create.size > 0 || this.pendingOrder.write.size > 0;
        if (stillPending) {
            this._scheduleRetrySync();
        } else {
            this._retryDelay = RETRY_INITIAL_DELAY;
        }
        return result;
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
            var hasPending =
                this.pendingOrder.create.size > 0 || this.pendingOrder.write.size > 0;

            // Reset offline flag if browser reports online
            if (this.data.network.offline && navigator.onLine) {
                console.info(
                    "[POS Offline] Periodic check: network restored, resetting offline flag"
                );
                this.data.network.offline = false;
                this.data.network.warningTriggered = false;
            }

            if (hasPending && navigator.onLine) {
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

    // ===== Offline-safe permission check =====

    async allowProductCreation() {
        if (this.data.network.offline) {
            return false;
        }
        return super.allowProductCreation();
    },
});
