/*
Copyright (C) 2015-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define('pos_check_session_state.chrome', function (require){

    "use strict";
    var rpc = require('web.rpc');
    var core = require('web.core');
    var chrome = require('point_of_sale.chrome');
    var _t = core._t;

    /*
        Overload build_widgets to add a check done every
        check_session_state_frequency seconds, by a setInterval.
    */
    chrome.Chrome.include({

        build_widgets: function () {
            var self = this;
            var res = this._super.apply(this, arguments);
            var frequency = self.pos.config.check_session_state_frequency * 1000;

            if (frequency) {
                self.intervalIDCheckSessionState = setInterval(function() {
                    self._check_session_state();
                }, frequency);
            }
            return res;
        },

        _check_session_state: function() {
            var self = this;
            var params = {
                model: 'pos.session',
                method: 'search_read',
                domain: [['id', '=', self.pos.pos_session.id]],
                fields: ['state'],
            };

            rpc.query(params)
            .then(function(sessions){
                if (sessions[0].state !== 'opened') {
                    var title = _t("Session not opened : ") + self.pos.pos_session.name;
                    var body = _t("This PoS window will be closed and you'll have to open a new session.");
                    if ((sessions[0].state) !== 'closing_control') {
                        body = _t("The session you're working on is in closing control : ") + body;
                    } else {
                        body = _t("The session you're working on is closed : ") + body;
                    }
                    // warn user if current session is not opened
                    self.gui.show_popup('error', {
                        'title': title,
                        'body': body,
                        cancel: function(){
                            self.gui.close();
                        },
                    });
                    clearInterval(self.intervalIDCheckSessionState);
                }
            })
            .fail(function(error, event){
                // Prevent error if server is unreachable
                event.preventDefault();
            });
        }
    });

});
