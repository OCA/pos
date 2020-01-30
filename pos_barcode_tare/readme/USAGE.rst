Install this add-on and configure the point of sale where you want to be able to use the tare barecode. Setup the default barcode sequence ID according to your barcode nomenclature. The barcode pattern should be ``XX.....NNDDD`` where XX is the barcode prefix. In the default barcode nomenclature, the weight barcode pattern sequence id is 36 and its prefix is 21. The label printing is done using web print. To streamline the label printing it is advised to use the silent printing mode (firefox) or the kiosk printing (chrome).

The command line to start a chrome base browser in kiosk mode with silent printing looks like:

``chromium-browser --use-system-default-printer --kiosk --kiosk-printing http://localhost:8069/``
