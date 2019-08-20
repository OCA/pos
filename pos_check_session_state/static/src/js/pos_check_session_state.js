/*
Copyright (C) 2015-Today GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define('pos_check_session_state.pos_check_session_state', function (require){

    "use strict";
    var PopupWidget = require('point_of_sale.popups');
    var gui = require('point_of_sale.gui');
    var chrome = require('point_of_sale.chrome');

    var rpc = require('web.rpc');

    /*
        Overload build_widgets to add a check done every
        check_session_state_frequency seconds, by a setInterval.
    */
    chrome.Chrome.include({

        build_widgets: function () {
            var self = this;
            var res = this._super.apply(this, arguments);
            var frequency = self.pos.config.check_session_state_frequency * 1000;

            self.intervalIDCheckSessionState = setInterval(function() {
                self._check_session_state();
            }, frequency);
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
                    // warn user if current session is not opened
                    self.gui.show_popup('error-closed-session', {session_state: sessions[0].state});
                    clearInterval(self.intervalIDCheckSessionState);
                }
            })
            .fail(function(error, event){
                // Prevent error if server is unreachable
                event.preventDefault();
            });
        }
    });

    /*
        Define : New ErrorClosedSessionPopupWidget Widget.
        This pop up will be shown if the current pos.session of the PoS is not
        in an 'open' state;
        The check will be done depending on a parameter on the PoS config
    */
    var ErrorClosedSessionPopupWidget = PopupWidget.extend({
        template: 'ErrorClosedSessionPopupWidget',

        show: function(options){
            this._super(options);
            this.gui.play_sound('error');
        },

    });

    gui.define_popup({name:'error-closed-session', widget: ErrorClosedSessionPopupWidget});

    return {
        ErrorClosedSessionPopupWidget: ErrorClosedSessionPopupWidget,
    };

});
