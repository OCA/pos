odoo.define('pos_self_service_base.chrome', function (require) {
    "use strict";
    // This file contains the different widgets available to all self-service screens
    // They are contained in a left-pane

    var PosBaseWidget = require('point_of_sale.BaseWidget');
    var chrome = require('point_of_sale.chrome');
    var core = require('web.core');
    var _t = core._t;

    /* ----- The Self Service Action Buttons ----- */

    // buttons for extra actions and controls
    // by pos_self_service extensions modules.

    var self_service_action_button_classes = [];
    var define_self_service_action_button = function(classe, options){
        options = options || {};

        var classes = self_service_action_button_classes;
        var index   = classes.length;
        var i;

        if (options.after) {
            for (i = 0; i < classes.length; i++) {
                if (classes[i].name === options.after) {
                    index = i + 1;
                }
            }
        } else if (options.before) {
            for (i = 0; i < classes.length; i++) {
                if (classes[i].name === options.after) {
                    index = i;
                    break;
                }
            }
        }
        classes.splice(i,0,classe);
    };

    var SelfServiceActionButtonWidget = PosBaseWidget.extend({
        template: 'SelfServiceActionButtonWidget',
        label: _t('Button'),
        renderElement: function(){
            var self = this;
            this._super();
            this.$el.click(function(){
                self.button_click();
            });
        },
        button_click: function(){},
        highlight: function(highlight){
            this.$el.toggleClass('highlight',!!highlight);
        },
        // alternative highlight color
        altlight: function(altlight){
            this.$el.toggleClass('altlight',!!altlight);
        },
    });

    /* -------- The Self-Service Home Button  -------- */

    // The home button allows the user to go to the startup screen.
    // It clears the navigation history stack
    var SelfServiceHomeButton = SelfServiceActionButtonWidget.extend({
        template: 'SelfServiceHomeButton',
        home_screen: 'selfservice',

        button_click: function () {
            this._super();
            this.gui.show_screen(this.home_screen);
        },
    });

    define_self_service_action_button({
        'name': 'home_button',
        'widget': SelfServiceHomeButton,
    });


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
        get_weight: function(){
            return this.weight;
        },
        get_weight_string: function() {
            var defaultstr = (this.weight || 0).toFixed(3) + ' kg';
            return defaultstr;
        },
    });



    // Add the self-service widgets to the Chrome
    chrome.Chrome.include({
        build_widgets: function(){
            if (this.pos.config.iface_self_service) {
                // here we add widgets available to all self-service screens
                this.widgets.push(
                    {
                        'name': 'self_service_scale_widget',
                        'widget': SelfServiceScaleWidget,
                        'replace': '.placeholder-SelfServiceScaleWidget',
                    },
                )
                this._super();
                this.self_service_action_buttons = {};
                var classes = self_service_action_button_classes;
                for (var i = 0; i < classes.length; i++) {
                    var classe = classes[i];
                    if (!classe.condition || classe.condition.call(this)) {
                        var widget = new classe.widget(this, {});
                        widget.appendTo(this.$('.self-service-control-buttons'));
                        this.self_service_action_buttons[classe.name] = widget;
                    }
                }
                if (_.size(this.self_service_action_buttons)) {
                    this.$('.self-service-control-buttons').removeClass('oe_hidden');
                }
                this.gui.set_startup_screen('selfservice');
                this.gui.set_default_screen('selfservice');
            };
        },
    });

    return {
        SelfServiceScaleWidget: SelfServiceScaleWidget,
    }

});
