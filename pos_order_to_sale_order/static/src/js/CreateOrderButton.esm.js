/** @odoo-module alias=pos_order_to_sale_order.CreateOrderButton**/
import PosComponent from "point_of_sale.PosComponent";
import ProductScreen from "point_of_sale.ProductScreen";
import Registries from "point_of_sale.Registries";

class CreateOrderButton extends PosComponent {
    async onClick() {
        await this.showPopup("CreateOrderPopup", {});
    }
}

CreateOrderButton.template = "CreateOrderButton";

ProductScreen.addControlButton({
    component: CreateOrderButton,
    condition: function () {
        return (
            this.env.pos.config.iface_create_sale_order &&
            this.env.pos.get_order().get_partner() &&
            this.env.pos.get_order().get_orderlines().length !== 0
        );
    },
});

Registries.Component.add(CreateOrderButton);
export default CreateOrderButton;
