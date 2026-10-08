import {ControlButtons} from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import {CreateOrderButton} from "@pos_order_to_sale_order/components/create_order_button/create_order_button.esm";
import {patch} from "@web/core/utils/patch";

patch(ControlButtons, {
    components: {
        ...ControlButtons.components,
        CreateOrderButton,
    },
});
