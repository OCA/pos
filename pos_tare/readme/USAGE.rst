Install this add-on and configure your point of sale. To enable this addon, go to your point of sale configuration page. There, enable the electronic scale and barcode reader in the "IoT Box" section. In the same page, look up for the "Tare input method" field, and choose a tare method. There are three tare methods:
- "manual", you'll set the tare value when you weight the product;
- "barcode", you'll scan the tare value from a barcode;
- "both", you can both of the above.

To generate a tare barcode you need to use the default barcode nomenclature. The default barcode pattern is `0700000{NNDDD}`. Using that pattern, the barcode for a tare of 0.1kg is `0700000001006`. The `pos_tare_barcode_generator` allows you to create tare labels right from the POS.
