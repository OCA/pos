/*
    Copyright 2023 Camptocamp (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
/* eslint-disable no-unused-vars */
odoo.define("pos_event_sale.MultiSelectButton", function (require) {
    "use strict";

    const {useState, useExternalListener} = owl;
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class MultiSelectButton extends PosComponent {
        setup() {
            super.setup();
            useExternalListener(window, "click", this.onWindowClick, true);
            useExternalListener(window, "keydown", this.onWindowKeydown);
            this.state = useState({open: false});
        }
        get items() {
            return this.props.items;
        }
        get checked() {
            return this.items.filter((item) => item.checked);
        }
        get values() {
            return this.checked.map((item) => item.value);
        }
        get icon() {
            return this.props.icon;
        }
        get label() {
            return this.props.string;
        }
        toggleOptions() {
            this.state.open = !this.state.open;
        }
        hideOptions() {
            if (this.state.open) this.state.open = false;
        }
        showOptions() {
            if (!this.state.open) this.state.open = true;
        }
        /**
         * @event
         * @param {Event} event
         */
        onClick(event) {
            this.toggleOptions();
        }
        /**
         * @event
         * @param {Event} event
         */
        onWindowClick(event) {
            if (
                !this.el.contains(event.target) &&
                !this.el.contains(document.activeElement)
            ) {
                this.hideOptions();
            }
        }
        /**
         * @event
         * @param {Event} event
         */
        onWindowKeydown(event) {
            if (event.key === "Escape") {
                this.hideOptions();
            }
        }
        /**
         * @event
         * @param {Object} item
         */
        onClickItem(item) {
            item.checked = !item.checked;
            if (this.props.hideOnClick) this.hideOptions();
            this.render();
            this.trigger("change", this.values);
        }
    }
    MultiSelectButton.template = "MultiSelectButton";

    Registries.Component.add(MultiSelectButton);
    return MultiSelectButton;
});
