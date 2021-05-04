odoo.define("pos_coupon.models", function(require) {
    "use strict";

    const models = require("point_of_sale.models");

    const _NumpadState_super = models.NumpadState.prototype;
    models.NumpadState = models.NumpadState.extend({
        /**
         * @override Allow to disable reset()
         * We need specifically in update-rewards event, as we don't want
         * to reset the numpad state simply because we're adding/removing reward lines.
         *
         * This is not needed in 15.0, but in 13.0 it's otherwise impossible to
         * type more than 1 digit in the numpad, when there's at least 1 active reward.
         */
        reset: function() {
            if (this._disable_reset) {
                return;
            }
            return _NumpadState_super.reset.apply(this, arguments);
        },
    });

    return models;
});
