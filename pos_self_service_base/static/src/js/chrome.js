odoo.define('pos_self_service_base.chrome', function (require) {
    "use strict";
    // This file contains the different widgets available to all self-service screens
    // They are contained in a left-pane

    var PosBaseWidget = require('point_of_sale.BaseWidget');
    var chrome = require('point_of_sale.chrome');

    /* -------- The Self-Service Scale Widget  -------- */

    var SelfServiceScaleWidget = PosBaseWidget.extend({
        template: 'SelfServiceScaleWidget',

        init: function(parent, options) {
            this._super(parent,options);
            this.weight = 0;
            this.renderElement()
        },
        start: function(){
            var self = this;
            this._super();
            var queue = this.pos.proxy_queue;

            this.set_weight(0);
            this.renderElement();

            queue.schedule(function(){
                return self.pos.proxy.scale_read().then(function(weight){
                    self.set_weight(weight.weight);
                });
            },{duration:500, repeat: true});
        },
        set_weight: function(weight){
            this.weight = weight;
            this.$('.weight').text(this.get_weight_string());
        },
        get_weight_string: function() {
            var defaultstr = (this.weight || 0).toFixed(3) + ' Kg';
            return defaultstr;
        },
    });

    /* -------- The Self-Service Home Button  -------- */
    // TODO

    /* -------- The Self-Service Back Button  -------- */
    // TODO


    // Add the self-service widgets to the Chrome
    chrome.Chrome.include({
        build_widgets: function(){
             // here we add widgets available to all self-service screens
            // - SelfServiceScaleWidget
            // - SelfServiceHomeButton
            // - SelfServiceBackButton
            this.widgets.push(
                {
                    'name': 'self_service_scale_widget',
                    'widget': SelfServiceScaleWidget,
                    'replace': '.placeholder-SelfServiceScaleWidget',
                },
            )
            this._super();
            if (this.pos.config.iface_self_service) {
                this.gui.set_startup_screen('selfservice');
                this.gui.set_default_screen('selfservice');
            }
        },
    });

});
