/* global document */
import * as Chrome from "@point_of_sale/../tests/pos/tours/utils/chrome_util";
import * as Dialog from "@point_of_sale/../tests/generic_helpers/dialog_util";
import * as PosHr from "@pos_hr/../tests/tours/utils/pos_hr_helpers";
import * as SelectionPopup from "@point_of_sale/../tests/tours/utils/selection_popup_util";

import {registry} from "@web/core/registry";

const CLOSE_POS_POPUP = ".close-pos-popup, .modal-dialog";
const TOTAL_ORDERS = ".total-orders";
const CLONE_BUTTON = "button.icon.fa.fa-clone.btn.btn-secondary";
const DAILY_SALE_BUTTON = "button.button.icon.btn.btn-secondary";
const CASH_INPUT = ".cash-input";

function assertBlindClosing(root) {
    if (root.querySelector(TOTAL_ORDERS)) {
        throw new Error(
            "The total orders section should be hidden for users without closing visibility rights."
        );
    }
    if (root.querySelector(CLONE_BUTTON)) {
        throw new Error(
            "The clone/details button should be hidden for users without closing visibility rights."
        );
    }
    if (root.querySelector(DAILY_SALE_BUTTON)) {
        throw new Error(
            "The daily sale button should be hidden for users without closing visibility rights."
        );
    }
    if (root.querySelector(".payment-methods-overview")) {
        throw new Error(
            "The payment methods overview should be hidden for users without closing visibility rights."
        );
    }
    if (root.querySelector(".cash-difference")) {
        throw new Error(
            "Payment differences should be hidden for users without closing visibility rights."
        );
    }
    for (const row of root.querySelectorAll(".fs-3")) {
        if (row.querySelectorAll("span").length > 1) {
            throw new Error(
                "Expected payment amounts should be hidden for users without closing visibility rights."
            );
        }
    }
    if (!root.querySelector(CASH_INPUT)) {
        throw new Error(
            "The cash count input should remain visible for users without closing visibility rights."
        );
    }
}

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

function openClosePosPopupAsEmployee(employeeName) {
    return [
        Chrome.startPoS(),
        ...PosHr.loginScreenIsShown(),
        ...PosHr.clickLoginButton(),
        ...SelectionPopup.has(employeeName, {run: "click"}),
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
                    trigger: CLONE_BUTTON,
                },
                {
                    trigger: DAILY_SALE_BUTTON,
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
                        assertBlindClosing(root);
                    },
                },
            ].flat(),
    });

registry
    .category("web_tour.tours")
    .add("pos_blind_session_closing_hr_hidden_for_employee_without_user", {
        steps: () =>
            [
                ...openClosePosPopupAsEmployee("Blind Employee Without User"),

                {
                    trigger: CLOSE_POS_POPUP,
                    run: function () {
                        const root =
                            document.querySelector(CLOSE_POS_POPUP) || document;
                        assertBlindClosing(root);
                    },
                },
            ].flat(),
    });

registry
    .category("web_tour.tours")
    .add("pos_blind_session_closing_hr_visible_for_employee_with_group", {
        steps: () =>
            [
                ...openClosePosPopupAsEmployee("Blind Employee With Group"),

                {
                    trigger: TOTAL_ORDERS,
                },
                {
                    trigger: CLONE_BUTTON,
                },
                {
                    trigger: DAILY_SALE_BUTTON,
                },
            ].flat(),
    });
