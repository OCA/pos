To use this module, you need to:

1. Open a Point of Sale session.
2. Identify combo products in the product grid by the **COMBO** badge in the top-left corner of the product card.
3. Click a combo product to open the **Configure Your Combo** popup:

   * **Mandatory Selection**:

     * On each required category line, the first product is pre-selected with its **Default Quantity**.
     * If **No. of Items** is ``1``, clicking another product in the same category automatically switches the selection to that product.
     * If **No. of Items** is greater than ``1``, you can select additional products up to the allowed limit (any additional product beyond the first on an included-price line will add to the **+ Extra** price).
     * Attempting to confirm without at least one selected item in every required line displays an alert.

   * **Customize & Extras**:

     * In optional categories, click any product card to select or deselect up to **No. of Items** products.

   * **Quantities & Filtering**:

     * Use the ``-`` and ``+`` stepper buttons on any selected product card to adjust its quantity up to the category's **No. of Items** limit (units above **Default Quantity** on included-price lines, or any unit on non-included lines, add to **+ Extra**).
     * Use the **Search Products...** search box in each category header to quickly locate products.

   * **Confirmation**:

     * Check the live **Base Price** and **+ Extra** chips in the header and click **Add to Order · <Total>** in the footer.

4. **Review & Edit in the Cart**:

   * In the POS cart, the combo line displays a **Combo Breakdown** with all selected sub-products and their quantities.
   * Click the **Edit** button on the combo orderline at any time to reopen the **Configure Your Combo** popup and modify products or quantities.

5. **Validate the Order**:

   * **POS Receipt**: Shows the main combo product and its **Included Items** breakdown.
   * **Backend POS Order**: Creates the main combo order line (with the final combo price) followed by individual sub-product lines marked as **Combo Item** with ``0.00`` unit price.
   * **Stock Picking**: Automatically deducts inventory for all selected sub-products.
   * **Invoice**: When invoiced, sub-products appear grouped under the combo with a ``↳`` indicator and a **Combo Item** badge on the printed invoice report.
