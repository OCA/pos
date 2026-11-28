import {HardwareProxy} from "@point_of_sale/app/hardware_proxy/hardware_proxy_service";
import {patch} from "@web/core/utils/patch";

patch(HardwareProxy.prototype, {
    async keepalive() {
        await super.keepalive();
        if (this.pos.config.iface_automatic_cashdrawer) {
            await this.pos.sendCashlogy("cashlogy/connect", {
                config: {
                    host: this.pos.config.iface_automatic_cashdrawer_ip_address,
                    port: this.pos.config.iface_automatic_cashdrawer_tcp_port,
                },
            });
        }
    },
});
