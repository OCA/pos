odoo.define("pos_employee_access_right.models", function (require) {
    "use strict";

    var models = require("point_of_sale.models");

    models.load_models([
        {
            model: "pos.employee.access.security",
            fields: [
                "id",
                "pos_component_id",
                "pos_event_type",
                "pos_payload",
                "job_position_id",
                "permission",
            ],
            loaded: function (self, access_right) {
                self.pos_access_right = access_right;
                self.component_access_check = self.get_component_access_to_check();
            },
        },
    ]);
    models.load_fields("hr.employee", ["job_id"]);

    var _super_posmodel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function (session, attributes) {
            this.component_access_check = false;
            return _super_posmodel.initialize.call(this, session, attributes);
        },
        get_component_access_to_check() {
            const component_access_check = {};

            for (const component_access in this.pos_access_right) {
                if (
                    !(
                        this.pos_access_right[component_access].pos_component_id[1] in
                        component_access_check
                    )
                ) {
                    component_access_check[
                        this.pos_access_right[component_access].pos_component_id[1]
                    ] = [this.pos_access_right[component_access].pos_event_type];
                } else if (
                    !component_access_check[
                        this.pos_access_right[component_access].pos_component_id[1]
                    ].includes(this.pos_access_right[component_access].pos_event_type)
                ) {
                    component_access_check[
                        this.pos_access_right[component_access].pos_component_id[1]
                    ].push(this.pos_access_right[component_access].pos_event_type);
                }
            }

            return component_access_check;
        },
        get_employee_access(employee_role, component_name, eventType, payload) {
            let component_access = [];
            component_access = this.pos_access_right.filter(
                (item) =>
                    item.pos_component_id[1] == component_name &&
                    item.job_position_id[0] == employee_role
            );

            if (component_access.lenght == 0) {
                return component_access;
            }

            component_access = component_access.filter(
                (item) => item.pos_event_type == eventType
            );

            if (payload) {
                component_access = component_access.filter(
                    (item) => item.pos_payload == JSON.stringify(payload)
                );
            }

            return component_access;
        },
    });
});
