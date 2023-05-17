/*
    Copyright (C) 2023 KMEE (https://kmee.com.br)
    @author: Felipe Zago <felipe.zago@kmee.com.br>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/
odoo.define("point_of_sale.CustomSelect", function (require) {
    "use strict";

    const {useState, onMounted} = owl.hooks;
    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");

    class CustomSelect extends PosComponent {
        setup() {
            onMounted(() => {
                this.parent = $("#" + this.props.id);
                this.selectOptions = this.parent.find(".o_custom_select_options");

                this.setEventListeners();
                this.selectFirstOption();
            });

            this.state = useState({});
        }

        get hasItemSelected() {
            return (
                (this.state.selectedItemId && this.state.selectedItemLabel) ||
                this.state.emptyOptionSelected
            );
        }

        willUpdateProps(nextProps) {
            const sameProps = _.isEqual(nextProps.list, this.props.list);
            if (!sameProps && this.hasItemSelected) {
                this.resetSelectedItemState();
            }
        }

        patched() {
            if (!this.hasItemSelected) {
                this.selectFirstOption();
            }
        }

        setEventListeners() {
            this.parent.on("click", ".selected, .o_custom_select_arrow", () =>
                this.selectOptions.toggle()
            );
            this.parent.on("click", ".o_custom_select_option", (ev) =>
                this.selectOption(ev)
            );

            const self = this;
            $(document).on("click", (e) => {
                // Hide select options if clicked outside the select.
                if ($(e.target).closest("#" + self.props.id).length === 0) {
                    self.selectOptions.hide();
                }
            });
        }

        selectOption(event) {
            const $target = $(event.currentTarget);
            this.resetSelectedItemState();

            if ($target.hasClass("o_empty_option")) {
                this.state.emptyOptionSelected = true;
            } else {
                this.state.selectedItemLabel = $target.html();
                this.state.selectedItemId = parseInt($target.attr("value"), 10);
            }

            this.selectOptions.hide();
        }

        resetSelectedItemState() {
            this.state.selectedItemId = null;
            this.state.selectedItemLabel = "";
            this.state.emptyOptionSelected = false;
        }

        selectFirstOption() {
            this.selectOptions.children().not(".o_empty_option").first().click();
        }
    }

    CustomSelect.template = "CustomSelect";

    Registries.Component.add(CustomSelect);

    return CustomSelect;
});
