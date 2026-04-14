/** @odoo-module **/
// Copyright (C) 2026 - Today: GRAP (http://www.grap.coop)
// @author: Quentin DUPONT
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import {PosGlobalState} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

const PosMoveReasonPosGlobalState = (PosGlobalState) =>
    class PosMoveReasonPosGlobalState extends PosGlobalState {
        async _processData(loadedData) {
            await super._processData(...arguments);
            this.pos_move_reason = loadedData["pos.move.reason"];
            this.account_journal = loadedData["account.journal"];
        }
    };

Registries.Model.extend(PosGlobalState, PosMoveReasonPosGlobalState);
