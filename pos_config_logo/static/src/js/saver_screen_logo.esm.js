import {patch} from "@web/core/utils/patch";
import {SaverScreen} from "@point_of_sale/app/screens/saver_screen/saver_screen";
import {usePos} from "@point_of_sale/app/store/pos_hook";

patch(SaverScreen.prototype, {
    setup() {
        super.setup();
        this.pos = usePos();
    },
    get saverLogoSrc() {
        const config = this.pos?.config;
        if (!config?.logo || !config.id) {
            return "/web/static/img/odoo_logo.svg";
        }
        return `/web/image?model=pos.config&id=${config.id}&field=logo`;
    },
});
