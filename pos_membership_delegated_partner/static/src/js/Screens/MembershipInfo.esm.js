/** @odoo-module */

import PosComponent from "point_of_sale.PosComponent";
import Registries from "point_of_sale.Registries";

export class MembershipInfo extends PosComponent {}
MembershipInfo.template = "MembershipInfo";

Registries.Component.add(MembershipInfo);
