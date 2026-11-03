This module allows to generate 2 types of barcodes, depending on type of the barcode nomenclature corresponding to the barcode of the selected product:

#. Weight barcodes (type ``weight``)
#. Price barcodes (type ``price`` or ``price_to_weight`` (see ``pos_price_to_weight`` module))

Please note that the weight encoded in weight barcodes is always expressed in kilograms, independently of any configuration.
The number of decimal places is defined by the barcode nomenclature corresponding to the barcode of the product.

Depending on the type of the barcode, the value string below the barcode expresses either:

* The encoded weight in the unit of measure of the product
* The price (in the currency used by the PoS), followed by the weight in the unit of measure of the product (between parentheses)

For price barcodes, the price encoded in the barcode includes taxes or not, depending on the type of tax used (``price_include`` field) on the product.
This is to ensure that the value is correctly interpreted when the barcode is scanned (it is computed in the same way).
The value string below the barcode expresses the price with or without taxes depending on the PoS configuration (``iface_tax_included`` field).
