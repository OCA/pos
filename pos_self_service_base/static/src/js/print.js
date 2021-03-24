const ipp = require("../lib/ipp");

var printer = ipp.Printer(
    "http://localhost:8631/printers/ZTC-ZD420-203dpi-ZPL"
);

window.printZPL = (zplString) => {
    console.log("Sending print job");
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
