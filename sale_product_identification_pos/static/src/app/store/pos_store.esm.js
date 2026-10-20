import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {ConnectionLostError} from "@web/core/network/rpc";
import {PosStore} from "@point_of_sale/app/store/pos_store";
import {WarningDialog} from "@web/core/errors/error_dialogs";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {sprintf} from "@web/core/utils/strings";

patch(PosStore.prototype, {
    _is_identification_enforced() {
        const sessionModel = this.models?.["pos.session"];
        const session = sessionModel?.getFirst ? sessionModel.getFirst() : null;
        return Boolean(session?.enforce_partner_identification);
    },

    _is_connection_issue(error) {
        return (
            error instanceof ConnectionLostError ||
            error?.name === "ConnectionLostError" ||
            error?.message?.includes("Failed to fetch") ||
            error?.status === 0
        );
    },

    _is_browser_offline() {
        const nav =
            typeof globalThis !== "undefined" ? globalThis.navigator : undefined;
        if (!nav) {
            return false;
        }
        if (nav.onLine) {
            return false;
        }
        return true;
    },

    _get_products_requiring_identification() {
        const currentOrder = this.get_order();
        const names = new Set();
        for (const line of currentOrder.lines) {
            if ((line.product_id.product_tmpl_category_ids || []).length) {
                names.add(line.product_id.display_name || line.product_id.name);
            }
        }
        return [...names];
    },

    _warn_offline_identification(products) {
        if (products.length === 0) {
            return Promise.resolve(false);
        }
        if (this._identificationOfflineWarned) {
            return Promise.resolve(true);
        }
        this._identificationOfflineWarned = true;
        const productsList = products.join(_t(", "));
        const template = _t(
            "Customer identification could not be validated for %(products)s because the server is unreachable. Do you still want to continue without verification?"
        );
        return new Promise((resolve) => {
            this.dialog.add(ConfirmationDialog, {
                title: _t("Identification warning"),
                confirmLabel: _t("Continue"),
                cancelLabel: _t("Cancel"),
                confirm: () => resolve(true),
                cancel: () => resolve(false),
                body: sprintf(template, {products: productsList}),
            });
        });
    },

    _show_enforced_block_message(reason, products) {
        if (!products.length) {
            return;
        }
        const productsList = products.join(_t(", "));
        let template = _t(
            "The product %(products)s cannot be sold because customer identification must be validated."
        );
        if (reason === "missing_customer") {
            template = _t(
                "The product %(products)s cannot be sold because no customer is set and identification enforcement is enabled."
            );
        } else if (reason === "offline") {
            template = _t(
                "The product %(products)s cannot be sold while the POS is offline because identifications cannot be validated."
            );
        }
        this._show_message_warning(sprintf(template, {products: productsList}), true);
    },

    _show_message_warning(message, mandatory = false) {
        if (mandatory) {
            this.dialog.add(WarningDialog, {
                title: _t("Identifications"),
                type: "warning",
                message: sprintf(message),
            });
        } else {
            this.dialog.add(ConfirmationDialog, {
                title: _t("Identifications"),
                confirmLabel: _t("Confirm"),
                confirm: this._confirmIdentification.bind(this),
                cancelLabel: _t("Cancel"),
                cancel: () => {
                    // Cancel
                },
                body: sprintf(message),
            });
        }
    },

    async _confirmIdentification() {
        const currentOrder = this.get_order();
        currentOrder.not_verify_identification = true;
        this.set_order(currentOrder);
        await this.pay();
    },

    _get_identifications(mandatory = false, all_identification = false) {
        const currentOrder = this.get_order();
        let categories_ident = [];
        let identifications = [];
        for (const line of currentOrder.lines) {
            var identification_by_mandatory =
                line.product_id.product_tmpl_category_ids.some(
                    (val) => val.is_mandatory === mandatory
                );
            if (identification_by_mandatory || all_identification) {
                if (all_identification) {
                    identifications = line.product_id.product_tmpl_category_ids;
                } else {
                    identifications = line.product_id.product_tmpl_category_ids.filter(
                        (val) => val.is_mandatory === mandatory
                    );
                }
                categories_ident = [
                    ...identifications.map((r) => r.category_id.id),
                    ...categories_ident,
                ];
            }
        }
        return [...new Set(categories_ident)];
    },

    async validate_order_identification(categories_ident, mandatory, options = {}) {
        const {enforced = false, products = []} = options;
        const currentOrder = this.get_order();
        const offlineProducts = products.length
            ? products
            : this._get_products_requiring_identification();
        let response = null;
        try {
            response = await this.data.orm.call(
                "res.partner.id_number",
                "validate_identification_pos",
                [[]],
                {
                    identification_ids: categories_ident,
                    partner_id: currentOrder.partner_id
                        ? currentOrder.partner_id.id
                        : false,
                    product_ids: currentOrder.lines
                        .filter(
                            (r) => r.product_id.product_tmpl_category_ids.length > 0
                        )
                        .map((line) => line.product_id.id),
                    mandatory: mandatory,
                    enforce_partner_identification: enforced,
                }
            );
        } catch (error) {
            if (this._is_connection_issue(error)) {
                if (enforced && offlineProducts.length) {
                    this._show_enforced_block_message("offline", offlineProducts);
                    return false;
                }
                const proceed =
                    await this._warn_offline_identification(offlineProducts);
                return proceed;
            }
            throw error;
        }
        if (!response || response === true) {
            return true;
        }
        const payload =
            typeof response === "string"
                ? {message: response, mandatory: mandatory}
                : response;
        if (payload.message) {
            this._show_message_warning(payload.message, payload.mandatory ?? mandatory);
            return false;
        }
        return true;
    },

    async _perform_identification_checks(currentOrder) {
        if (currentOrder.not_verify_identification) {
            currentOrder.not_verify_identification = false;
            this.set_order(currentOrder);
            return true;
        }

        this._identificationOfflineWarned = false;
        const enforced = this._is_identification_enforced();
        const identificationProducts = this._get_products_requiring_identification();
        if (enforced && identificationProducts.length && !currentOrder.partner_id) {
            this._show_enforced_block_message(
                "missing_customer",
                identificationProducts
            );
            return false;
        }
        if (enforced && identificationProducts.length && this._is_browser_offline()) {
            this._show_enforced_block_message("offline", identificationProducts);
            return false;
        }

        const batches = this._prepare_identification_batches(currentOrder);
        for (const batch of batches) {
            const ok = await this.validate_order_identification(
                batch.ids,
                batch.mandatory,
                {
                    enforced,
                    products: identificationProducts,
                }
            );
            if (!ok) {
                return false;
            }
        }

        currentOrder.not_verify_identification = false;
        this.set_order(currentOrder);
        return true;
    },

    _prepare_identification_batches(currentOrder) {
        const batches = [];
        const allIdentifications = this._get_identifications(false, true);
        if (allIdentifications.length > 0 && !currentOrder.partner_id) {
            batches.push({ids: allIdentifications, mandatory: true});
            return batches;
        }
        const mandatoryIdentifications = this._get_identifications(true);
        if (mandatoryIdentifications.length) {
            batches.push({ids: mandatoryIdentifications, mandatory: true});
        }
        const optionalIdentifications = this._get_identifications(false);
        if (optionalIdentifications.length) {
            batches.push({ids: optionalIdentifications, mandatory: false});
        }
        return batches;
    },

    async pay() {
        const currentOrder = this.get_order();
        const canProceed = await this._perform_identification_checks(currentOrder);
        if (!canProceed) {
            return;
        }
        await super.pay();
    },
});
