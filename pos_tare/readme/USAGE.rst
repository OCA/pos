Install this add-on and configure the point of sale where you want to be able to use the tare barecode. The label printing is done using web print. To streamline the label printing it is advised to use the silent printing mode (firefox) or the kiosk printing (chrome).

The command line to start a chrome base browser in kiosk mode with silent printing looks like:

``chromium-browser --use-system-default-printer --kiosk --kiosk-printing http://localhost:8069/``
