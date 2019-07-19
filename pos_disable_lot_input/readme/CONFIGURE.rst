To have products with lot tracking:

1. Go to *Inventory > Settings* and set the option *Track lots or serial
   numbers*
2. Chose a product that is stockable, go to its *Inventory*
   tab, and set *Tracking* to *By Lots*.
3. Go to its *Sales* tab and set it as *Available in the Point of Sale*.
4. Click on *Update Qty On Hand*, chose the same location configured in the
   POS you want the lot available in; write a quantity; unfold the *Lot/Serial
   Number* field and pick create one if none is available yet.
5. Create a new lot with the serial number of your choice.

To inhibit lots in a point of sale:

1. Go to *Point of Sale > Configuration > Point of Sale* and choose one.
2. In the *Inventory* section of configuration, uncheck "Input lots from the
   frontend".

To configure auto assign:

1. You need to install `stock_pack_operation_auto_fill`.
2. Go to the PoS stock operation type.
3. In the section *Packs and Lots* you should have the following scheme:
   - *Create New Lots/Serial Numbers*: optional
   - *Use Existing Lots/Serial Numbers*: checked
   - *Auto fill operations*: checked
   - *Avoid auto-assignment of lots*: unchecked
4. In the product categories or in the affected locations, set your desired
   product removal strategy (i.e. FIFO, LIFO, FEFO...).
