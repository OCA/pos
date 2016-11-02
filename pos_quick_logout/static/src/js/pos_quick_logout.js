/*
    Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define('pos_quick_logout.pos_quick_logout', function (require) {
    "use strict";

    var chrome = require('point_of_sale.chrome');

/* ********************************************************
chrome.Chrome
******************************************************** */
    chrome.Chrome.include({
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
