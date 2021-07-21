odoo.define("pos_backend_communication.back", function (require) {
    "use strict";
    const tools = require("pos_backend_communication.tools");
    const ActionManager = require("web.ActionManager");
    const core = require("web.core");

    function is_tied_to_pos() {
        return Boolean(window.opener);
        // TODO : add test location.origin
    }

    function sendMessage(a) {
        // Send message to pos
        if (is_tied_to_pos()) {
            // Can only work if the backoffice is opened by the POS
            window.opener.postMessage(a, location.origin);
        }
    }

    if (is_tied_to_pos()) {
        // Set up action 'act_tell_pos' called by .py
        ActionManager.include({
            _handleAction: function (action, options) {
                if (action.type === "ir.actions.tell_pos") {
                    return this._executeTellPOSAction(action, options);
                }
                return this._super.apply(this, arguments);
            },
            _executeTellPOSAction: function (action, options) {
                /* eslint no-unused-vars: ["error", { "args": "none" }]*/
                sendMessage(action.params);
                return $.when();
            },
        });
        // When page is fully loaded
        core.bus.on("web_client_ready", null, function () {
            // This class hides menus
            $("body").addClass("pos_backend_communication");
        });
    }

    return {
        sendMessage: sendMessage,
        callbacks: tools.callbacks,
        is_tied_to_pos: is_tied_to_pos,
    };
});
