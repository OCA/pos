/*
    Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
    Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
odoo.define('pos_quick_logout.pos_quick_logout', function(require) {
    "use strict";

    var chrome = require('point_of_sale.chrome');
    var core = require('web.core');

    /* ********************************************************
    chrome.Chrome
    ******************************************************** */
    chrome.Chrome.include({
        start: function() {
            var self = this;
            this._super();
            this.timer = false;
            this.idletimeout();
        },
        idletimeout: function() {
            var self = this;
            $(document).bind('mousemove keypress mousedown click scroll', function() {
                self.resetTimer();
            });
        },
        logout: function() {
            var self = this;
            if (self.widget.username) {
                self.pos.set_cashier(self.pos.user);
                self.widget.username.renderElement();
            }
        },
        resetTimer: function() {
            var self = this;
            clearTimeout(this.timer);
            if (self.pos.config && self.pos.config.logout_timeout) {
                this.timer = setTimeout(function(){
                    self.logout();
                }, self.pos.config.logout_timeout * 1000);
            }
        },
        renderElement: function() {
            this._super();
            var self = this;
            this.$('#pos-quick-logout').click(function() {
                self.pos.set_cashier(self.pos.user);
                self.widget.username.renderElement();
            });
        }
    });

    /* ********************************************************
    chrome.Chrome
    ******************************************************** */
    chrome.UsernameWidget.include({
        renderElement: function() {
            this._super();
            if (this.pos.user.id === this.pos.get_cashier().id) {
                $('#pos-quick-logout').hide();
            } else {
                $('#pos-quick-logout').show();
            }
        }
    });

});
