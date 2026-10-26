This module allows configuring and selling customizable product combos and packs in the Point of Sale (POS) interface.

**Key Features**:

* **Combo Product Configuration**: Mark any product with **Use as Combo** to configure its component rules inside the **Combo Configuration** tab.
* **Mandatory & Optional Categories**: Define **Required Products** (mandatory selection) and optional add-on categories grouped by POS Category.
* **Automatic or Manual Product Selection**: Automatically load all POS-available products from a category using **Include all Products**, or manually pick specific products.
* **Flexible Pricing Rules**:

  * When **Include in Main Product Price** is enabled, the first selected product on that line (up to its **Default Quantity**) is included at no extra cost in the combo base price, while any additional selected product or quantity above the default adds to the **Extra Price**.
  * When **Include in Main Product Price** is disabled, every selected item and unit adds its price to the **Extra Price**.

* **Selection Limits & Default Quantities**: Configure **Default Quantity** and maximum selectable **No. of Items** per category line, with backend validation preventing invalid quantities or duplicate optional categories.
* **Modern POS Interface**:

  * **COMBO** badge pill on combo product cards in the POS product grid.
  * **Configure Your Combo** modal divided into **Mandatory Selection** and **Customize & Extras** sections, with per-category search (**Filter category...**), selection counters, quantity steppers (``-`` / ``+``), and live **Base Price**, **+ Extra**, and **Add to Order** total calculation.
  * Configurable product thumbnails in the popup via **View Combo Product Image** in POS settings.
  * Direct **Edit** button and **Combo Breakdown** list on POS cart orderlines.

* **End-to-End Traceability (Receipt, Order, Stock & Invoice)**:

  * Displays selected combo items on the POS receipt.
  * Automatically expands combo sub-products into POS Order lines with ``0.00`` unit price (marked with **Combo Item**) so stock pickings deduct component inventory accurately.
  * Formats combo sub-lines cleanly on printed customer invoices with an indented ``↳`` indicator and **Combo Item** badge.
