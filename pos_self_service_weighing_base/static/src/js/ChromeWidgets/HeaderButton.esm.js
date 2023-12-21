/** @odoo-module alias=pos_self_service_weighing_base.HeaderButton **/
// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import HeaderButton from "point_of_sale.HeaderButton";
import Registries from "point_of_sale.Registries";
import {isConnectionError} from "point_of_sale.utils";

const SelfServiceWeighingHeaderButton = (HeaderButton) =>
    class extends HeaderButton {
        async onClick() {
            if (!this.env.pos.config.is_self_service_weighing_point) {
                return super.onClick();
            }
            try {
                const info = await this.env.pos.getClosePosInfo();
                this.showPopup("CloseSelfServiceWeighingPopup", {
                    info: info,
                    keepBehind: true,
                });
            } catch (e) {
                if (isConnectionError(e)) {
                    this.showPopup("OfflineErrorPopup", {
                        title: this.env._t("Network Error"),
                        body: this.env._t(
                            "Please check your internet connection and try again."
                        ),
                    });
                } else {
                    this.showPopup("ErrorPopup", {
                        title: this.env._t("Unknown Error"),
                        body: this.env._t(
                            "An unknown error prevents us from getting closing information."
                        ),
                    });
                }
            }
        }
    };
Registries.Component.extend(HeaderButton, SelfServiceWeighingHeaderButton);
export default SelfServiceWeighingHeaderButton;
