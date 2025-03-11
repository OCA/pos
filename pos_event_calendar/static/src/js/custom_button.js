import { Component } from "@odoo/owl";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { useService } from "@web/core/utils/hooks";
import { ControlButtons } from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import { patch } from "@web/core/utils/patch";
import { EventSelectorPopup } from "./Popups/EventSelectorPopup/EventSelectorPopup";

export class EventButton extends Component {
    static template = "pos_event_calendar.EventButton";
   
    setup() {
        super.setup();
        this.pos = usePos();
        this.ui = useService("ui");
        this.dialog = services.dialog;
    }

}

patch(ControlButtons.prototype, {
    components: {
        ...ControlButtons.components,
        EventButton,
    },
        /**
     * Called when the button is clicked. Open the EventSelectorPopup.
     */
        async onClick() {
            await this.dialog.add(EventSelectorPopup);
        }
});
