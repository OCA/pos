// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

odoo.define("pos_self_service_weight_base.HeaderButton", function (require) {
    "use strict";

    const HeaderButton = require("point_of_sale.HeaderButton");
    const Registries = require("point_of_sale.Registries");
    const {isConnectionError} = require('point_of_sale.utils');

    const SelfServiceHeaderButton = (HeaderButton) => class extends HeaderButton {
        async onClick() {
            if (!this.env.pos.config.is_self_service_weight_point) {
                return super.onClick();
            }
            try {
                const info = await this.env.pos.getClosePosInfo();
                this.showPopup('CloseSelfServicePopup', {info: info, keepBehind: true});
            } catch (e) {
                if (isConnectionError(e)) {
                    this.showPopup('OfflineErrorPopup', {
                        title: this.env._t('Network Error'),
                        body: this.env._t('Please check your internet connection and try again.'),
                    });
                } else {
                    this.showPopup('ErrorPopup', {
                        title: this.env._t('Unknown Error'),
                        body: this.env._t('An unknown error prevents us from getting closing information.'),
                    });
                }

            }
        }
    }
    Registries.Component.extend(HeaderButton, SelfServiceHeaderButton);
});
