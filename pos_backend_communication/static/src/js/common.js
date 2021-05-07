odoo.define("pos_backend_communication.tools", function (require) {
    "use strict";
    var translation = require("web.translation");
    var core = require("web.core");
    var _t = translation._t;
    var callbacks = {};

    function dispatchMessageEvent(message) {
        // Don't be tricked by others sites
        if (message.origin !== window.location.origin) {
            return console.error("Message coming from untrusted source");
        }

        if (!message.data.type) {
            return console.error("Uncompliant message");
        }

        var fun = callbacks[message.data.type];
        if (fun) {
            fun(message);
        } else if (core.debug) {
            console.error("Unkown message type", message.data.type);
        }
    }

    function open_page(url, msg, identifier) {
        var bo = window.open(url, identifier || "backoffice"); // Unique identifier of the 2nd window
        if (!bo) {
            throw _t("Please authorize popups for this window");
        }
        bo.postMessage(msg, window.location.origin); // Because backoffice.alert set focus
    }

    window.addEventListener("message", dispatchMessageEvent);
    return {
        callbacks: callbacks,
        open_page: open_page,
    };
});
