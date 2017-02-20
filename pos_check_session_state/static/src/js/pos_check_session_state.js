/******************************************************************************
    Point Of Sale - Check Session State module for Odoo
    Copyright (C) 2015-Today GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/

openerp.pos_check_session_state = function (instance) {
    module = instance.point_of_sale;

    /* 
        Define : New ErrorClosedSessionPopupWidget Widget.
        This pop up will be shown if the current pos.session of the PoS is not
        in an 'open' state;
        The check will be down each 10 minuts;
    */  
    module.ErrorClosedSessionPopupWidget = module.ErrorPopupWidget.extend({
        template:'ErrorClosedSessionPopupWidget',

        check_session_frequency: 10*60*1000,

        session_name: '',

        init: function(parent, options) {
            var self = this;
            this._super(parent,options);
            this.intervalID = setInterval(function() {
                var loaded = self.pos.fetch('pos.session', ['name','state'], [['id', '=', self.pos.get('pos_session').id]]) 
                .then(function(sessions){
                    if (sessions[0]['state'] != 'opened') {
                        // warn user if current session is not opened
                        self.session_name = sessions[0]['name'];
                        self.renderElement();
                        self.pos_widget.screen_selector.show_popup('error-closed-session');
                        clearInterval(self.intervalID);
                    }
                })
                .fail(function(error, event){
                    // Prevent error if server is unreachable
                    event.preventDefault();
                });
            }, this.check_session_frequency);
        },
    });

    /* 
        Overload : PosWidget to include ErrorClosedSessionPopupWidget inside.
    */
    module.PosWidget = module.PosWidget.extend({
        build_widgets: function(){
            this._super();
            this.error_closed_session_popup = new module.ErrorClosedSessionPopupWidget(this, {});
            this.error_closed_session_popup.appendTo($('.point-of-sale'));
            this.screen_selector.popup_set['error-closed-session'] = this.error_closed_session_popup;

            // Hide the popup because all pop up are displayed at the
            // beginning by default
            this.error_closed_session_popup.hide();
        },
    });

};
