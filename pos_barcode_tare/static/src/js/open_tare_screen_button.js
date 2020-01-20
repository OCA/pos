odoo.define('tare-screen-button.button', function (require) {
    "use strict";
    var core = require('web.core');
    var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');

    var TareScreenButton = screens.ActionButtonWidget.extend({
        template: 'TareScreenButton',

        button_click: function(){
            var self = this;
            this.gui.show_screen('tare');
        }
    });

    screens.define_action_button({
        'name': 'tareScreenButton',
        'widget': TareScreenButton,
    });
});
