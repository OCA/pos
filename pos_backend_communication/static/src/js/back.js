'use strict';

odoo.define('pos_backend_communication.back', function (require) {
    var tools = require('pos_backend_communication.tools');
    var ActionManager = require('web.ActionManager');
    var core = require('web.core')

    function is_tied_to_pos() {
        return (!!window.opener);
        //TODO : add test location.origin
    }

    function sendMessage(a) {
        //send message to pos
        if (is_tied_to_pos()) {
            //can only work if the backoffice is opened by the POS
            window.opener.postMessage(a, location.origin);
        }
    }

    if (is_tied_to_pos()) {
        //set up action 'act_tell_pos' called by .py
        ActionManager.include({
            ir_actions_act_tell_pos: function (action, options) {
                sendMessage(action.payload);
            }
        });

        //when page is fully loaded
        core.bus.on('web_client_ready', null, function () {
            //this class hides menus
            $('body').addClass('pos_backend_communication');
        });
    }

    return {
      'sendMessage': sendMessage,
      'callbacks': tools.callbacks,
      'is_tied_to_pos': is_tied_to_pos,
    };

});