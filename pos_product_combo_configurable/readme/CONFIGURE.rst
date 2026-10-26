To configure this module, you need to:

1. Go to **Point of Sale > Configuration > Settings** (or the settings of a specific Point of Sale), locate the **POS Combo Packs** section, and enable or disable **View Combo Product Image** depending on whether you want sub-product thumbnails shown in the POS combo popup.
2. Go to **Point of Sale > Products > Products** and create or open the main combo product.
3. Enable the **Use as Combo** checkbox under the product title.
4. Open the **Combo Configuration** tab and add one or more category lines:

   * **Category**: Select the POS Category for the line.
   * **Required Products**: Enable if the cashier/customer must keep at least one item selected from this line. When opening the combo popup in POS, only the **first product** of each required line is pre-selected by default.
   * **Include in Main Product Price**:

     * If enabled, the first selected product on this line (up to **Default Quantity**) is included in the combo's base price; selecting a second product or increasing the quantity above **Default Quantity** adds an **Extra Price**.
     * If disabled, any selected product on this line adds its unit price multiplied by the selected quantity to the **Extra Price**.

   * **Include all Products**: Enable to automatically populate all POS-available non-combo products belonging to the selected **Category**, or leave disabled to choose specific products manually.
   * **Product**: Select the allowed sub-products for this category line.
   * **Default Quantity**: Set the initial quantity assigned when a product is selected (must be at least ``1``).
   * **No. of Items**: Set the maximum total number of items/units that can be selected in this category line (whether picking different products or multiple units of the same product with ``+``).
