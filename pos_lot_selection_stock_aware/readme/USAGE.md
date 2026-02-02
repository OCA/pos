## Configuration

1. Go to **Inventory > Products > Products**
2. Enable tracking on products:

   * Set **Tracking** to "By Unique Serial Number" or "By Lots"
   * Ensure **Product Type** is "Storable Product"
3. Configure your Point of Sale:

   * **Point of Sale > Configuration > Point of Sale**
   * Verify **Operation Type** settings
   * Check that **Source Location** is set correctly

## Creating Lots

1. **Inventory > Products > Lots/Serial Numbers**
2. Click **Create**
3. Fill in:

   * **Lot/Serial Number**: e.g., "LOT001"
   * **Product**: Select your product
4. Add stock to your POS location via inventory adjustments or purchase orders

## Using in POS

1. Open a POS session
2. Click to open a lot-tracked product to the cart
3. The lot selection popup will appear showing:

   * Available lots with quantities: "LOT001 (Qty: 15)"
   * Only lots with stock > 0 at the POS location
   * A dropdown interface (no manual typing)
4. Select a lot and proceed with the sale
