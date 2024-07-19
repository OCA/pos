odoo.define("pos_discount.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const _super_posmodel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function () {
            _super_posmodel.initialize.apply(this, arguments);
            this.config_logo = null;
            this.config_logo_base64 = "";
        },
    });

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        export_for_printing: function () {
            const receipt = _super_order.export_for_printing.apply(this, arguments);
            if (this.pos.config.logo) {
                receipt.company.logo = this.pos.config_logo_base64;
            }
            return receipt;
        },
    });
    models.load_models([
        {
            label: "config_logo",
            loaded: (self) => {
                self.config_logo = new Image();
                return new Promise(function (resolve, reject) {
                    self.config_logo.onload = function () {
                        var img = self.config_logo;
                        var ratio = 1;
                        var targetwidth = 300;
                        var maxheight = 150;
                        if (img.width !== targetwidth) {
                            ratio = targetwidth / img.width;
                        }
                        if (img.height * ratio > maxheight) {
                            ratio = maxheight / img.height;
                        }
                        var width = Math.floor(img.width * ratio);
                        var height = Math.floor(img.height * ratio);
                        var c = document.createElement("canvas");
                        c.width = width;
                        c.height = height;
                        var ctx = c.getContext("2d");
                        ctx.drawImage(self.config_logo, 0, 0, width, height);

                        self.config_logo_base64 = c.toDataURL();
                        resolve();
                    };
                    self.config_logo.onerror = function () {
                        reject();
                    };
                    self.config_logo.crossOrigin = "anonymous";
                    self.config_logo.src = `/web/image?model=pos.config&id=${self.config.id}&field=logo`;
                });
            },
        },
    ]);
});
