// SPDX-FileCopyrightText: 2024 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

odoo.define('pos_self_service_weight_base.CloseSelfServicePopup', function (require){
    'use strict';
    const ClosePosPopup = require('point_of_sale.ClosePosPopup');
    const Registries = require('point_of_sale.Registries');

    class CloseSelfServicePopup extends ClosePosPopup {}
    CloseSelfServicePopup.template = 'CloseSelfServicePopup';
    Registries.Component.add(CloseSelfServicePopup);

    return CloseSelfServicePopup;
});
