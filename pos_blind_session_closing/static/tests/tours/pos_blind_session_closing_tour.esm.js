/* global document */
import * as Chrome from "@point_of_sale/../tests/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/tours/utils/dialog_util";

import {registry} from "@web/core/registry";

const CLOSE_POS_POPUP = ".close-pos-popup, .modal-dialog";
const TOTAL_ORDERS = ".total-orders";
const PAYMENT_METHODS_OVERVIEW = ".payment-methods-overview";

const CLONE_BUTTON = "button.icon.fa.fa-clone.btn.btn-secondary";
const SECONDARY_BUTTON = "button.button.icon.btn.btn-secondary";

function openClosePosPopup() {
    return [
        Chrome.startPoS(),
        Dialog.confirm("Open Register"),
        Chrome.clickMenuOption("Close Register"),
        {
            trigger: CLOSE_POS_POPUP,
        },
    ];
}

registry
    .category("web_tour.tours")
    .add("pos_blind_session_closing_visible_for_manager", {
        steps: () =>
            [
                ...openClosePosPopup(),

                {
                    trigger: TOTAL_ORDERS,
                },
                {
                    trigger: PAYMENT_METHODS_OVERVIEW,
                },
                {
                    trigger: CLONE_BUTTON,
                },
                {
                    trigger: SECONDARY_BUTTON,
                },
            ].flat(),
    });

registry
    .category("web_tour.tours")
    .add("pos_blind_session_closing_hidden_for_cashier", {
        steps: () =>
            [
                ...openClosePosPopup(),

                {
                    trigger: CLOSE_POS_POPUP,
                    run: function () {
                        const root =
                            document.querySelector(CLOSE_POS_POPUP) || document;

                        const totalOrders = root.querySelector(TOTAL_ORDERS);
                        const paymentOverview = root.querySelector(
                            PAYMENT_METHODS_OVERVIEW
                        );
                        const cloneButton = root.querySelector(CLONE_BUTTON);
                        const secondaryButton = root.querySelector(SECONDARY_BUTTON);

                        if (totalOrders) {
                            throw new Error(
                                "The total orders section should be hidden for users without closing visibility rights."
                            );
                        }
                        if (paymentOverview) {
                            throw new Error(
                                "The payment methods overview should be hidden for users without closing visibility rights."
                            );
                        }
                        if (cloneButton) {
                            throw new Error(
                                "The clone/details button should be hidden for users without closing visibility rights."
                            );
                        }
                        if (secondaryButton) {
                            throw new Error(
                                "The secondary closing action button should be hidden for users without closing visibility rights."
                            );
                        }
                    },
                },
            ].flat(),
    });
