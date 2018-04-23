/* License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */


odoo.define("pos_ticket_logo.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    var exports = {};

    var _pictures = _.findWhere(
        models.PosModel.prototype.models,
        {label: "pictures"}
    );
    _pictures.loaded = function (self) {
        self.company_logo = new Image();
        var logo_loaded = new $.Deferred();
        self.company_logo.onload = function () {
            var img = self.company_logo;
            var ratio = 1;
            var targetwidth = 260;
            var maxheight = 120;
            if (img.width !== targetwidth) {
                ratio = targetwidth / img.width;
            }
            if (img.height * ratio > maxheight) {
                ratio = maxheight / img.height;
            }
            var width = Math.floor(img.width * ratio);
            var height = Math.floor(img.height * ratio);
            var c = document.createElement('canvas');
            c.width = width;
            c.height = height;
            var ctx = c.getContext('2d');
            ctx.drawImage(self.company_logo, 0, 0, width, height);
            self.company_logo_base64 = c.toDataURL();
            logo_loaded.resolve();
        };
        self.company_logo.onerror = function () {
            logo_loaded.reject();
        };
        self.company_logo.crossOrigin = "anonymous";
        self.company_logo.src = '/web/binary/image?model=res.company&id=' +
                                self.company.id + '&field=logo';
        return logo_loaded;
    };

    return exports;
});
