odoo.define("pos_restricted_customer_list.point_of_sale.models", function(require) {
    "use strict";

    var rpc = require("web.rpc");
    var PosModels = require("point_of_sale.models");
    var PosModel = PosModels.PosModel;
    var PosModelSuper = PosModel.prototype;

    PosModels.PosModel = PosModel.extend({
        initialize: function(session, attributes) {
            var self = this;
            var res_partner_index = 0;
            for (var i = 0; i < self.models.length; i++) {
                var model = self.models[i];
                var model_name = model.model;
                if (model_name === "res.partner") {
                    model.domain = function(myself) {
                        return myself.prepare_partners_domain();
                    };
                    res_partner_index = i;
                }
            }
            var res_partner = self.models.splice(res_partner_index, 1);
            self.models.push(res_partner[0]);
            self.models.push({
                model: "res.partner.category",
                fields: ["name"],
                loaded: function(myself, categories) {
                    myself.categories = categories;
                    myself.config.category = null;
                    for (var j = 0; j < categories.length; j++) {
                        if (categories[j].id === myself.config.partner_category_id[0]) {
                            myself.config.category = categories[j];
                        }
                    }
                },
            });
            return PosModelSuper.initialize.call(self, session, attributes);
        },

        prepare_partners_domain: function() {
            var self = this;
            var domain = [["available_in_pos", "=", true]];
            if (self.config && self.config.partner_category_id) {
                domain.push([
                    "category_id",
                    "child_of",
                    self.config.partner_category_id
                        ? self.config.partner_category_id[0]
                        : 0,
                ]);
            }
            return domain;
        },

        prepare_new_partners_domain: function(){
            var self = this;
            var domain = PosModelSuper.prepare_new_partners_domain.call(self);
            var partners_domain = self.prepare_partners_domain();
            domain.push.apply(domain, partners_domain);
            return domain;
        },
    });
});

odoo.define("pos_restricted_customer_list.point_of_sale.screens", function(require) {
    "use strict";

    var core = require("web.core");
    var QWeb = core.qweb;
    var _t = core._t;
    var rpc = require("web.rpc");
    var PosScreens = require("point_of_sale.screens");
    var ClientListScreenWidget = PosScreens.ClientListScreenWidget;

    ClientListScreenWidget.include({
        display_client_details: function(visibility, partner, clickpos) {
            var self = this;
            var contents = this.$(".client-details-contents");
            var parent = this.$(".client-list").parent();
            var scroll = parent.scrollTop();
            var height = contents.height();

            contents.off("click", ".button.edit");
            contents.off("click", ".button.save");
            contents.off("click", ".button.undo");
            contents.on("click", ".button.edit", function() {
                self.edit_client_details(partner);
            });
            contents.on("click", ".button.save", function() {
                self.save_client_details(partner);
            });
            contents.on("click", ".button.undo", function() {
                self.undo_client_details(partner);
            });
            this.editing_client = false;
            this.uploaded_picture = null;

            if (visibility === "show") {
                contents.empty();
                contents.append(
                    $(
                        QWeb.render("ClientDetails", {
                            widget: this,
                            partner: partner,
                        })
                    )
                );

                var new_height = contents.height();

                if (!this.details_visible) {
                    // Resize client list to take into account client details
                    parent.height("-=" + new_height);

                    if (clickpos < scroll + new_height + 20) {
                        parent.scrollTop(clickpos - 20);
                    } else {
                        parent.scrollTop(parent.scrollTop() + new_height);
                    }
                } else {
                    parent.scrollTop(parent.scrollTop() - height + new_height);
                }

                this.details_visible = true;
                this.toggle_save_button();
            } else if (visibility === "edit") {
                this.editing_client = true;
                contents.empty();
                contents.append(
                    $(
                        QWeb.render("ClientDetailsEdit", {
                            widget: this,
                            partner: partner,
                            config: self.pos.config,
                        })
                    )
                );
                this.toggle_save_button();

                // Browsers attempt to scroll invisible input elements
                // into view (eg. when hidden behind keyboard). They don't
                // seem to take into account that some elements are not
                // scrollable.
                contents.find("input").blur(function() {
                    setTimeout(function() {
                        self.$(".window").scrollTop(0);
                    }, 0);
                });

                contents.find(".image-uploader").on("change", function(event) {
                    self.load_image_file(event.target.files[0], function(res) {
                        if (res) {
                            contents
                                .find(".client-picture img, .client-picture .fa")
                                .remove();
                            contents
                                .find(".client-picture")
                                .append("<img src='" + res + "'>");
                            contents.find(".detail.picture").remove();
                            self.uploaded_picture = res;
                        }
                    });
                });
            } else if (visibility === "hide") {
                contents.empty();
                parent.height("100%");
                if (height > scroll) {
                    contents.css({height: height + "px"});
                    contents.animate({height: 0}, 400, function() {
                        contents.css({height: ""});
                    });
                } else {
                    parent.scrollTop(parent.scrollTop() - height);
                }
                this.details_visible = false;
                this.toggle_save_button();
            }
        },
        // OVERWRITE OF STANDARD ODOO TO RETURN DEFERRED
        saved_client_details: function(partner_id) {
            var self = this;
            return this.reload_partners().then(function() {
                var partner = self.pos.db.get_partner_by_id(partner_id);
                if (partner) {
                    self.new_client = partner;
                    self.toggle_save_button();
                    self.display_client_details("show", partner);
                } else {
                    // Should never happen, because create_from_ui must return the id of the partner it
                    // has created, and reload_partner() must have loaded the newly created partner.
                    self.display_client_details("hide");
                }
            });
        },
        save_client_details: function(partner) {
            var self = this;

            var fields = {};
            this.$(".client-details-contents .detail").each(function(idx, el) {
                fields[el.name] = el.value;
            });

            if (!fields.name) {
                this.gui.show_popup("error", _t("A Customer Name Is Required"));
                return;
            }

            if (this.uploaded_picture) {
                fields.image = this.uploaded_picture;
            }

            fields.id = partner.id || false;

            if (fields.country_id) {
                fields.country_id = parseInt(fields.country_id, 10);
            } else {
                fields.country_id = false;
            }
            fields.barcode = fields.barcode || "";
            if (fields.category_id) {
                fields.category_id = [[6, 0, [parseInt(fields.category_id, 10)]]];
            } else {
                fields.category_id = false;
            }

            var contents = this.$(".client-details-contents");
            contents.off("click", ".button.save");

            rpc.query({
                model: "res.partner",
                method: "create_from_ui",
                args: [fields],
            }).then(
                function(partner_id) {
                    self.saved_client_details(partner_id);
                },
                function(err, event) {
                    self.gui.chrome.loading_hide();
                    event.preventDefault();
                    var error_body = _t("Your Internet connection is probably down.");
                    if (err.data) {
                        var except = err.data;
                        error_body =
                            (except.arguments && except.arguments[0]) ||
                            except.message ||
                            error_body;
                    }
                    self.gui.show_popup("error", {
                        title: _t("Error: Could not Save Changes"),
                        body: error_body,
                    });
                    contents.on('click', '.button.save', function () {
                        self.save_client_details(partner);
                    });
                }
            );
        },
    });
});
