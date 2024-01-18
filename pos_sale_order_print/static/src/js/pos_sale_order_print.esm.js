/** @odoo-module **/

import {PosGlobalState} from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

const ReportPosGlobalState = (OriginalPosGlobalState) =>
    class extends OriginalPosGlobalState {
        async _processData(loadedData) {
            await super._processData(...arguments);

            this.ir_actions_report = loadedData["ir.actions.report"];
        }
    };

Registries.Model.extend(PosGlobalState, ReportPosGlobalState);
