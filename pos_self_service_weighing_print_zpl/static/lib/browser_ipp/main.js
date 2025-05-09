// SPDX-FileCopyrightText: 2025 Coop IT Easy SC
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const ipp = require("../ipp/ipp.js");

window.ippPrint = function (printerURL, documentFormat, dataString, encoding) {
    const printer = ipp.Printer(printerURL);
    return new Promise((resolve, reject) => {
        printer.execute(
            "Print-Job",
            {
                "operation-attributes-tag": {
                    "document-format": documentFormat,
                },
                data: Buffer.from(dataString),
            },
            (err, res) => {
                if (err !== null) {
                    return reject(err);
                }
                return resolve(res);
            }
        );
    });
};
