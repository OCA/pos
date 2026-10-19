/** @odoo-module **/
/* global */

export class QZConnection {
    static async _ensureLoaded() {
        if (window.qz) return true;
        // Fallback: dynamically load qz-tray.js if POS runs in isolated iframe
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "/base_report_to_printer_qztray/static/src/lib/qz-tray.js";
            script.type = "text/javascript";
            script.onload = () => {
                console.info("[QZ Tray] dynamically loaded for POS iframe");
                resolve(true);
            };
            script.onerror = () => {
                console.error("[QZ Tray] failed to load");
                reject(new Error("QZ Tray script could not be loaded"));
            };
            document.head.appendChild(script);
        });
    }

    static async connect(host = null) {
        await this._ensureLoaded();
        if (!window.qz) throw new Error("QZ Tray is not available");
        const opts = host ? {host} : {};
        if (!window.qz.websocket.isActive()) {
            await window.qz.websocket.connect(opts);
        }
    }

    static async disconnect() {
        if (window.qz?.websocket?.isActive()) {
            await window.qz.websocket.disconnect();
        }
    }

    static async print(printerName, data, opts = {}) {
        await this._ensureLoaded();
        const qz = window.qz;
        await qz.security.setCertificatePromise((resolve, reject) => {
            fetch("/qz-certificate", {
                cache: "no-store",
                headers: {"Content-Type": "text/plain"},
            })
                .then((response) =>
                    response
                        .text()
                        .then((text) => (response.ok ? resolve(text) : reject(text)))
                )
                .catch(reject);
        });

        await qz.security.setSignatureAlgorithm("SHA512");
        await qz.security.setSignaturePromise((toSign) => (resolve, reject) => {
            fetch(`/qz-sign-message?request=${toSign}`, {
                cache: "no-store",
                headers: {"Content-Type": "text/plain"},
            })
                .then((response) =>
                    response
                        .text()
                        .then((text) => (response.ok ? resolve(text) : reject(text)))
                )
                .catch(reject);
        });
        await qz.websocket.connect();
        const config = qz.configs.create(printerName, opts);
        await qz.print(config, data);
        await qz.websocket.disconnect();
        return true;
    }
}
