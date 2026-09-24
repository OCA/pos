import {AutomaticCashdrawerAdmin} from "@pos_automatic_cashdrawer_cashlogy/dialogs/cashdrawer_admin.esm";
import {Navbar} from "@point_of_sale/app/navbar/navbar";
import {onWillStart} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";
import {user} from "@web/core/user";

patch(Navbar.prototype, {
    setup() {
        super.setup(...arguments);
        onWillStart(async () => {
            this.allowCashlogy = await user.hasGroup(
                "pos_automatic_cashdrawer_cashlogy.group_pos_automatic_cashlogy_config"
            );
        });
    },
    get showCashlogyAdmin() {
        return this.pos.config.iface_automatic_cashdrawer && this.allowCashlogy;
    },
    openCashlogyAdmin() {
        this.dialog.add(AutomaticCashdrawerAdmin, {});
    },
});
