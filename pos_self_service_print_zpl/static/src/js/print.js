const ipp = require("../lib/ipp");

window.printZPL = (printerName, zplString) => {
    console.log("Sending print job");
    var printer = ipp.Printer("http://localhost:8631/printers/" + printerName);

    printer.execute(
        "Print-Job",
        {
            "operation-attributes-tag": {
                "document-format": "text/plain",
            },
            data: Buffer.from(zplString),
        },
        function (err, res) {
            console.log(res);
        }
    );
};
