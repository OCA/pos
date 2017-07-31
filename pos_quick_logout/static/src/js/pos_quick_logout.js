/*
    Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define('pos_quick_logout.pos_quick_logout', function (require) {
    "use strict";

    var chrome = require('point_of_sale.chrome');
    var core = require('web.core');

/* ********************************************************
chrome.Chrome
******************************************************** */
    chrome.Chrome.include({
        init: function(){
            var self = this;
            this._super();
            var idleTime = 0;
            //Increment the idle time counter every minute.
            setInterval(function(){
                idleTime = idleTime + 1;
                console.log(idleTime);
                if (self.widget.username && idleTime > self.pos.config.logout_timeout) {
                    self.pos.set_cashier(self.pos.user);
                    self.widget.username.renderElement();
                };
            }, 1000); // 1 second

            //Zero the idle timer on mouse movement.
            this.$el.mousemove(function (e) {
                console.log('mouse');
                idleTime = 0;
            });
            this.$el.keypress(function (e) {
                console.log('keypress');
                idleTime = 0;
            });
            this.$el.click(function (e) {
                console.log('click');
                idleTime = 0;
            });
            console.log(this);
        },
        renderElement: function(){
            this._super();
            var self = this;
            this.$('#pos-quick-logout').click(function(){
                self.pos.set_cashier(self.pos.user);
                self.widget.username.renderElement();
            });
        },
    });

/* ********************************************************
chrome.Chrome
******************************************************** */
    chrome.UsernameWidget.include({
        renderElement: function(){
            this._super();
             if (this.pos.user.id != this.pos.get_cashier().id){
                $('#pos-quick-logout').show();
            }else{
                $('#pos-quick-logout').hide();
            }
        },
    });
});
