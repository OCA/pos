/*
Copyright 2021 Camptocamp SA - Iván Todorovich
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/
odoo.define("pos_partner_lang.models", function(require) {
    "use strict";

    const models = require("point_of_sale.models");

    models.load_fields("res.partner", ["lang"]);

    models.load_models([
        {
            model: "res.lang",
            label: "Languages",
            before: "res.partner",
            fields: ["code", "name"],
            loaded: function(self, languages) {
                self.db.languages = languages;
                self.db.languages_by_code = languages.reduce(
                    (map, rec) => ((map[rec.code] = rec), map),
                    {}
                );
            },
        },
    ]);

    return models;
});
