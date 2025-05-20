# Point of Sale - Product Info Location

This module enhances the Point of Sale (POS) system by displaying the stock quantities of a product by location directly in the product information popup.

## Key Features

- Shows the list of internal stock locations where the product is available.
- Displays real-time available quantities per location.
- Automatically filters out locations with zero quantity.
- Only displays locations that are children of the POS configuration's stock operation type's source location (e.g., WH/Stock).
- Compatible with complex location structures like:
  - WH/Stock/Shelf1/Drawer1
  - WH/Stock/Shelf2/Drawer3
  - WH/Stock2/Shelf1/Drawer2
- Bonus: If the trusted_config_ids field is set on the POS configuration, quantities from trusted locations will also be shown without duplication.

## Use Case

This module is especially useful in warehouse environments where stock is distributed across multiple sub-locations and the POS user needs quick access to location-specific inventory data to improve picking efficiency and customer service.