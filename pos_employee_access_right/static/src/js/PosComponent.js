odoo.define("pos_employee_access_right.PosComponent", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    PosComponent.prototype.trigger = async function (eventType, payload) {
        if (
            this.env.pos.component_access_check &&
            this.constructor.name in this.env.pos.component_access_check &&
            this.env.pos.component_access_check[this.constructor.name].includes(
                eventType
            )
        ) {
            if (!this.env.pos.get_cashier().job_id) {
                if (!payload || payload.props.title != this.env._t("Password ?")) {
                    const {confirmed, payload: inputPin} = await this.showPopup(
                        "NumberPopup",
                        {
                            isPassword: true,
                            title: this.env._t("Password ?"),
                            startingValue: null,
                        }
                    );

                    if (!confirmed) return false;

                    const managers = this.env.pos.employees.filter(
                        (employee) => employee.pin && employee.role == "manager"
                    );
                    let permission = false;

                    for (const i in managers) {
                        if (managers[i].pin == Sha1.hash(inputPin)) {
                            permission = true;
                            break;
                        }
                    }

                    if (permission) {
                        this.__trigger(this, eventType, payload);
                    } else {
                        await this.showPopup("ErrorPopup", {
                            title: this.env._t("Incorrect Password"),
                        });
                    }
                } else {
                    this.__trigger(this, eventType, payload);
                }
            } else {
                const job_position = this.env.pos.get_cashier().job_id[0];
                let access_right = this.env.pos.get_employee_access(
                    job_position,
                    this.constructor.name,
                    eventType,
                    payload
                );
                if (access_right.length == 0) {
                    this.__trigger(this, eventType, payload);
                } else {
                    access_right = access_right[0];
                    if (access_right.permission == "allowed") {
                        this.__trigger(this, eventType, payload);
                    } else if (access_right.permission == "partially_allowed") {
                        const {confirmed, payload: inputPin} = await this.showPopup(
                            "NumberPopup",
                            {
                                isPassword: true,
                                title: this.env._t("Password ?"),
                                startingValue: null,
                            }
                        );

                        if (!confirmed) return false;

                        const managers = this.env.pos.employees.filter(
                            (employee) => employee.pin && employee.role == "manager"
                        );
                        let permission = false;

                        for (const i in managers) {
                            if (managers[i].pin == Sha1.hash(inputPin)) {
                                permission = true;
                                break;
                            }
                        }

                        if (permission) {
                            this.__trigger(this, eventType, payload);
                        } else {
                            await this.showPopup("ErrorPopup", {
                                title: this.env._t("Incorrect Password"),
                            });
                        }
                    } else if (access_right.permission == "not_allowed") {
                        this.showPopup("ErrorPopup", {
                            title: this.env._t("No Permission"),
                            body: this.env._t(
                                "You don't have permission to do this action in the POS."
                            ),
                        });
                    }
                }
            }
        } else {
            this.__trigger(this, eventType, payload);
        }
    };

    return PosComponent;
});
