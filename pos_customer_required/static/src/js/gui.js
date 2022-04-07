/*
    Copyright (C) 2004-Today Apertoso NV (<http://www.apertoso.be>)
    Copyright (C) 2016-Today La Louve (<http://www.lalouve.net/>)
    Copyright (C) 2022-Today Roberto Fichera (<https://levelprime.com/>)

    @author: Jos DE GRAEVE (<Jos.DeGraeve@apertoso.be>)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)

    The licence is in the file __manifest__.py
*/

odoo.define("pos_customer_required.gui", function(require) {
    "use strict";

    const gui = require("point_of_sale.gui");

    /*
        Because of clientlist screen behaviour, it is not possible to simply
        use: set_default_screen('clientlist') + remove cancel button on
        customer screen.

        Instead of,
        - we overload the function : show_screen(screen_name,params,refresh),
        - and we replace the required screen by the 'clientlist' screen if the
        current PoS Order has no Customer.
    */

    const _show_screen_ = gui.Gui.prototype.show_screen;
    gui.Gui.prototype.show_screen = function(screen_name, params, refresh) {
        if (
            this.pos.config.require_customer == "order" &&
            !this.pos.get_order().get_client() &&
            screen_name != "clientlist"
        ) {
            // We call first the original screen, to avoid to break the
            // 'previous screen' mecanism
            _show_screen_.call(this, screen_name, params, refresh);
            screen_name = "clientlist";
        }
        _show_screen_.call(this, screen_name, params, refresh);
    };

    return gui;
});
