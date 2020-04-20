/**
Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define('pos_place.widgets', function (require) {
    "use strict";

    var PosBaseWidget = require('point_of_sale.BaseWidget');
    var core = require('web.core');
    var _t = core._t;

    var PlaceNameWidget = PosBaseWidget.extend({
        template: 'PlaceNameWidget',
        renderElement: function () {
            var self = this;
            this._super();

            this.$el.click(function () {
                self.click_place();
            });
        },
        click_place: function () {
            var self = this;
            this.gui.select_place({}).then(function (place) {
                self.pos.set_place(place);
                self.renderElement();
            });
        },
        is_visible: function () {
            return this.pos.config.use_pos_place &&
            this.pos.user.groups_id.indexOf(
                this.pos.config.group_pos_place_user_id[0]) !== -1;
        },
        get_name: function () {
            var place = this.pos.get_place();
            if (place) {
                return place.code;
            }
            return _t("Place");

        },
    });

    return {
        PlaceNameWidget: PlaceNameWidget,
    };

});
