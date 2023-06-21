odoo.define("pos_employee_access_right.PosComponent", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const NumberBuffer = require("point_of_sale.NumberBuffer");

    const _superTrigger = PosComponent.prototype.trigger;

    const getManagerPassword = async (component) => {
        const numpad_buffer = NumberBuffer.get();
        const cleanNumBuffer = () => {
            // In the case of using access permission for functionalities
            // that also involve the use of NumberBuffer,
            // it is possible that there is a buffer conflict.
            const currentOrder = component.env.pos.get_order();
            if (currentOrder && currentOrder.get_selected_orderline()) {
                const orderline = currentOrder.get_selected_orderline();
                if (numpad_buffer == "" && orderline.quantity !== 0) {
                    NumberBuffer.reset();
                }
            }
        };

        while (true) {
            const {confirmed, payload: inputPin} = await component.showPopup(
                "NumberPopup",
                {
                    isPassword: true,
                    title: component.env._t("Password ?"),
                    startingValue: null,
                    accessIgnore: true,
                }
            );
            if (!confirmed) {
                cleanNumBuffer();
                return false;
            }
            const managers = component.env.pos.employees.filter(
                (employee) => employee.pin && employee.role == "manager"
            );
            // TODO: What should happend when an attendant has the same password as any other manager?
            if (managers.find((m) => m.pin == Sha1.hash(inputPin))) {
                cleanNumBuffer();
                return true;
            }
            await component.showPopup("ErrorPopup", {
                title: component.env._t("Incorrect Password"),
                accessIgnore: true,
            });
        }
    };

    PosComponent.prototype.trigger = async function (eventType, payload) {
        if (payload && payload.props && payload.props.accessIgnore) {
            return _superTrigger.apply(this, arguments);
        }
        if (
            !this.env.pos.component_access_check ||
            !(this.constructor.name in this.env.pos.component_access_check) ||
            !this.env.pos.component_access_check[this.constructor.name].includes(
                eventType
            )
        ) {
            return _superTrigger.apply(this, arguments);
        }
        if (!this.env.pos.get_cashier().job_id) {
            if (!(await getManagerPassword(this))) {
                return false;
            }
            return _superTrigger.apply(this, arguments);
        } else {
            const job_position = this.env.pos.get_cashier().job_id[0];
            let access_right = this.env.pos.get_employee_access(
                job_position,
                this.constructor.name,
                eventType,
                payload
            );
            if (access_right.length == 0) {
                return _superTrigger.apply(this, arguments);
            }
            access_right = access_right[0];
            if (access_right.permission == "allowed") {
                return _superTrigger.apply(this, arguments);
            } else if (access_right.permission == "partially_allowed") {
                if (!(await getManagerPassword(this))) {
                    return false;
                }
                return _superTrigger.apply(this, arguments);
            } else if (access_right.permission == "not_allowed") {
                return this.showPopup("ErrorPopup", {
                    title: this.env._t("No Permission"),
                    body: this.env._t(
                        "You don't have permission to do this action in the POS."
                    ),
                    accessIgnore: true,
                });
            }
            return _superTrigger.apply(this, arguments);
        }
    };

    return PosComponent;
});
