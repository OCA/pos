import {Navbar} from "@point_of_sale/app/navbar/navbar";
import {patch} from "@web/core/utils/patch";

patch(Navbar.prototype, {
    get posHeaderLogoSrc() {
        const config = this.pos?.config;
        if (!config?.logo || !config.id) {
            return "/web/static/img/logo.png";
        }
        return `/web/image?model=pos.config&id=${config.id}&field=logo`;
    },
});
