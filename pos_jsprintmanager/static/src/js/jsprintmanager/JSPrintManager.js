/*!
 * JSPrintManager v2.0.4
 * https://neodynamic.com/products/printing/js-print-manager
 *
 * GitHub Repo 
 * https://github.com/neodynamic/jsprintmanager
 *
 * Requires zip.js, zip-ext.js, and defalte.js files from 
 * https://github.com/gildas-lormeau/zip.js
 * 
 * Requires JSPrintManager Client App
 * https://neodynamic.com/downloads/jspm
 *
 * Copyright Neodynamic SRL
 * https://neodynamic.com
 * Date: 2019-01-01
 */
var JSPM;
(function (JSPM) {
    var ClientPrintJob = (function () {
        function ClientPrintJob() {
            this._clientPrinter = null;
            this._printerCommandsCopies = 1;
            this._printerCommands = "";
            this._binaryPrinterCommands = null;
            this._printFileGroup = [];
        }
        Object.defineProperty(ClientPrintJob.prototype, "clientPrinter", {
            get: function () {
                return this._clientPrinter;
            },
            set: function (value) {
                this._clientPrinter = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ClientPrintJob.prototype, "printerCommandsCopies", {
            get: function () {
                return this._printerCommandsCopies;
            },
            set: function (value) {
                if (value < 1)
                    throw "Copies must be greater than or equal to 1.";
                this._printerCommandsCopies = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ClientPrintJob.prototype, "printerCommands", {
            get: function () {
                return this._printerCommands;
            },
            set: function (value) {
                this._printerCommands = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ClientPrintJob.prototype, "binaryPrinterCommands", {
            get: function () {
                return this._binaryPrinterCommands;
            },
            set: function (value) {
                this._binaryPrinterCommands = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ClientPrintJob.prototype, "files", {
            get: function () {
                return this._printFileGroup;
            },
            enumerable: true,
            configurable: true
        });
        ClientPrintJob.prototype.sendToClient = function () {
            var _this = this;
            return new Promise(function (ok, err) {
                _this._generateDataAsync()
                    .then(function (data) {
                    JSPM.JSPrintManager.WS.send(data)
                        .then(function (i) {
                        ok(i);
                    })
                        .catch(function (e) {
                        err(e);
                    });
                })
                    .catch(function (e) {
                    err(e);
                });
            });
        };
        ClientPrintJob.prototype._intToByteArray = function (number) {
            return new Uint8Array([
                number & 0xff,
                (number >> 8) & 0xff,
                (number >> 16) & 0xff,
                (number >> 24) & 0xff
            ]);
        };
        ClientPrintJob.prototype._genPFGArrayAsync = function (printFileGroup) {
            var SEPARATOR = ",";
            return new Promise(function (resolve, reject) {
                if (!zip)
                    reject("zip.js, zip-ext.js, and deflate.js files from https://github.com/gildas-lormeau/zip.js project are missing.");
                else {
                    zip.useWebWorkers = false;
                    zip.createWriter(new zip.BlobWriter("application/zip"), function (zipWriter) {
                        function addPrintFile2Zip(pf_idx) {
                            if (pf_idx >= printFileGroup.length) {
                                zipWriter.close(function (zipBlob) {
                                    resolve(zipBlob);
                                });
                            }
                            else {
                                var printFile = printFileGroup[pf_idx];
                                var file_1 = pf_idx +
                                    SEPARATOR +
                                    printFile.copies +
                                    SEPARATOR +
                                    printFile.fileName;
                                printFile
                                    .serialize()
                                    .then(function (reader) {
                                    zipWriter.add(file_1, reader, function () {
                                        addPrintFile2Zip(pf_idx + 1);
                                    });
                                })
                                    .catch(function (e) {
                                    reject(e);
                                });
                            }
                        }
                        if (printFileGroup.length != 0)
                            addPrintFile2Zip(0);
                    }, function (e) {
                        reject(e);
                    });
                }
            });
        };
        ClientPrintJob.prototype._genPCArrayAsync = function (printerCommands, binPrinterCommands, printerCopies) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                try {
                    var copies = _this._str2UTF8Array(printerCopies.toString());
                    var pcc_copies = new Uint8Array(0);
                    if (printerCopies > 1) {
                        pcc_copies = new Uint8Array(5 + copies.length);
                        pcc_copies.set([80, 67, 67, 61]);
                        pcc_copies.set(copies, 4);
                        pcc_copies.set([124], 4 + copies.length);
                    }
                    if (binPrinterCommands != null && binPrinterCommands.length > 0)
                        resolve(new Blob([pcc_copies, binPrinterCommands]));
                    if (printerCommands.length != 0) {
                        var binPC = new Uint8Array(_this._str2UTF8Array(printerCommands));
                        resolve(new Blob([pcc_copies, binPC]));
                    }
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        ClientPrintJob.prototype._str2UTF8Array = function (str) {
            var utf8 = [];
            for (var i = 0; i < str.length; i++) {
                var charcode = str.charCodeAt(i);
                if (i == 0 &&
                    charcode == 0xef &&
                    i + 1 < str.length &&
                    str.charCodeAt(i + 1) == 0xbb &&
                    i + 2 < str.length &&
                    str.charCodeAt(i + 2) == 0xbf) {
                    utf8.push(0xef);
                    utf8.push(0xbb);
                    utf8.push(0xbf);
                    i += 2;
                }
                else if (charcode < 0x100)
                    utf8.push(charcode);
                else if (charcode < 0x800) {
                    utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
                }
                else if (charcode < 0xd800 || charcode >= 0xe000) {
                    utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
                }
                else {
                    i++;
                    charcode =
                        0x10000 +
                            (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
                    utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
                }
            }
            return utf8;
        };
        ClientPrintJob.prototype._genPrinterArrayAsync = function (clientPrinter) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                try {
                    if (!clientPrinter)
                        clientPrinter = new JSPM.UserSelectedPrinter();
                    var toRet = new Uint8Array(_this._str2UTF8Array(clientPrinter.serialize()));
                    resolve(toRet);
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        ClientPrintJob.prototype._generateDataAsync = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var header = new Uint8Array([99, 112, 106, 2]);
                var licenseTD = JSPM.JSPrintManager.license_url;
                Promise.race([
                    _this._genPCArrayAsync(_this._printerCommands, _this.binaryPrinterCommands, _this._printerCommandsCopies),
                    _this._genPFGArrayAsync(_this._printFileGroup)
                ])
                    .then(function (file_data) {
                    _this._genPrinterArrayAsync(_this._clientPrinter)
                        .then(function (printer_data) {
                        var idx1 = _this._intToByteArray(file_data.size);
                        var idx2 = _this._intToByteArray(file_data.size + printer_data.length);
                        resolve(new Blob([
                            header,
                            idx1,
                            idx2,
                            file_data,
                            printer_data,
                            licenseTD
                        ]));
                    })
                        .catch(function (e) {
                        reject(e);
                    });
                })
                    .catch(function (e) {
                    reject(e);
                });
            });
        };
        return ClientPrintJob;
    }());
    JSPM.ClientPrintJob = ClientPrintJob;
})(JSPM || (JSPM = {}));
var JSPM;
(function (JSPM) {
    var ClientPrintJobGroup = (function () {
        function ClientPrintJobGroup() {
            this._jobs = [];
        }
        Object.defineProperty(ClientPrintJobGroup.prototype, "jobs", {
            get: function () {
                return this._jobs;
            },
            enumerable: true,
            configurable: true
        });
        ClientPrintJobGroup.prototype.sendToClient = function () {
            var _this = this;
            return new Promise(function (ok, err) {
                _this._generateDataAsync()
                    .then(function (data) {
                    JSPM.JSPrintManager.WS.send(data)
                        .then(function (i) {
                        ok(i);
                    })
                        .catch(function (e) {
                        err(e);
                    });
                })
                    .catch(function (e) {
                    err(e);
                });
            });
        };
        ClientPrintJobGroup.prototype._generateMiniJob = function (cj) {
            var INDEXES_SIZE = 8;
            return new Promise(function (ok, error) {
                Promise.race([
                    cj._genPCArrayAsync(cj.printerCommands, cj.binaryPrinterCommands, cj.printerCommandsCopies),
                    cj._genPFGArrayAsync(cj.files)
                ])
                    .then(function (file_data) {
                    cj._genPrinterArrayAsync(cj.clientPrinter)
                        .then(function (printer_data) {
                        var idx1 = cj._intToByteArray(file_data.size);
                        var idx2 = cj._intToByteArray(file_data.size + printer_data.length);
                        ok(new Blob([idx1, idx2, file_data, printer_data]));
                    })
                        .catch(function (e) {
                        error(e);
                    });
                })
                    .catch(function (e) {
                    error(e);
                });
            });
        };
        ClientPrintJobGroup.prototype._generateDataAsync = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var header = new Uint8Array([99, 112, 106, 103, 2]);
                var jobs_qty = new Uint8Array(_this._intToArray(_this.jobs.length));
                var licenseTD = JSPM.JSPrintManager.license_url;
                var promises = [];
                for (var i = 0; i < _this.jobs.length; i++) {
                    promises.push(_this._generateMiniJob(_this.jobs[i]));
                }
                Promise.all(promises)
                    .then(function (data_arr) {
                    var jobs = data_arr.reduce(function (prev, curr) { return new Blob([prev, curr]); });
                    resolve(new Blob([header, jobs_qty, jobs, licenseTD]));
                })
                    .catch(function (error) {
                    reject(error);
                });
            });
        };
        ClientPrintJobGroup.prototype._intToArray = function (number) {
            return [
                number & 0xff,
                (number >> 8) & 0xff,
                (number >> 16) & 0xff,
                (number >> 24) & 0xff
            ];
        };
        return ClientPrintJobGroup;
    }());
    JSPM.ClientPrintJobGroup = ClientPrintJobGroup;
})(JSPM || (JSPM = {}));
var JSPM;
(function (JSPM) {
    var DefaultPrinter = (function () {
        function DefaultPrinter() {
            this.Id = String.fromCharCode(0);
        }
        DefaultPrinter.prototype.serialize = function () {
            return this.Id;
        };
        return DefaultPrinter;
    }());
    JSPM.DefaultPrinter = DefaultPrinter;
    var InstalledPrinter = (function () {
        function InstalledPrinter(printerName, printToDefaultIfNotFound, trayName, paperName) {
            if (printToDefaultIfNotFound === void 0) { printToDefaultIfNotFound = false; }
            if (trayName === void 0) { trayName = ''; }
            if (paperName === void 0) { paperName = ''; }
            this.Id = String.fromCharCode(1);
            this._name = "";
            this._printDefault = false;
            this._tray = "";
            this._paper = "";
            if (!printerName)
                throw "The specified printer name is null or empty.";
            this._name = printerName;
            this._printDefault = printToDefaultIfNotFound;
            this._paper = paperName;
            this._tray = trayName;
        }
        InstalledPrinter.prototype.bool2str = function (value, true_val, false_val) {
            if (true_val === void 0) { true_val = '1'; }
            if (false_val === void 0) { false_val = '0'; }
            return value ? true_val : false_val;
        };
        Object.defineProperty(InstalledPrinter.prototype, "printerName", {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InstalledPrinter.prototype, "printToDefaultIfNotFound", {
            get: function () {
                return this._printDefault;
            },
            set: function (value) {
                this._printDefault = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InstalledPrinter.prototype, "trayName", {
            get: function () {
                return this._tray;
            },
            set: function (value) {
                this._tray = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InstalledPrinter.prototype, "paperName", {
            get: function () {
                return this._paper;
            },
            set: function (value) {
                this._paper = value;
            },
            enumerable: true,
            configurable: true
        });
        InstalledPrinter.prototype.serialize = function () {
            var SEP = "|";
            if (!this._name) {
                throw "The specified printer name is null or empty.";
            }
            return this.Id + this._name + SEP +
                this.bool2str(this._printDefault, '1', '0') + SEP +
                this._tray + SEP + this._paper;
        };
        return InstalledPrinter;
    }());
    JSPM.InstalledPrinter = InstalledPrinter;
    var ParallelPortPrinter = (function () {
        function ParallelPortPrinter(portName) {
            this.Id = String.fromCharCode(2);
            this._parallelPortName = "LPT1";
            if (!portName)
                throw "The specified parallel port name is null or empty.";
            this._parallelPortName = portName;
        }
        Object.defineProperty(ParallelPortPrinter.prototype, "portName", {
            get: function () {
                return this._parallelPortName;
            },
            set: function (value) {
                this._parallelPortName = value;
            },
            enumerable: true,
            configurable: true
        });
        ParallelPortPrinter.prototype.serialize = function () {
            if (!this.portName)
                throw "The specified parallel port name is null or empty.";
            return this.Id + this.portName;
        };
        return ParallelPortPrinter;
    }());
    JSPM.ParallelPortPrinter = ParallelPortPrinter;
    var SerialPortPrinter = (function () {
        function SerialPortPrinter(portName, baudRate, parity, stopBits, dataBits, flowControl) {
            this.Id = String.fromCharCode(3);
            this._serialPortName = "COM1";
            this._serialPortBaudRate = 9600;
            this._serialPortParity = JSPM.Serial.Parity.None;
            this._serialPortStopBits = JSPM.Serial.StopBits.One;
            this._serialPortDataBits = 8;
            this._serialPortFlowControl = JSPM.Serial.Handshake.XOnXOff;
            if (!portName)
                throw "The specified serial port name is null or empty.";
            this._serialPortName = portName;
            this._serialPortBaudRate = baudRate;
            this._serialPortParity = parity;
            this._serialPortStopBits = stopBits;
            this._serialPortDataBits = dataBits;
            this._serialPortFlowControl = flowControl;
        }
        Object.defineProperty(SerialPortPrinter.prototype, "portName", {
            get: function () {
                return this._serialPortName;
            },
            set: function (value) {
                this._serialPortName = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SerialPortPrinter.prototype, "baudRate", {
            get: function () {
                return this._serialPortBaudRate;
            },
            set: function (value) {
                this._serialPortBaudRate = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SerialPortPrinter.prototype, "parity", {
            get: function () {
                return this._serialPortParity;
            },
            set: function (value) {
                this._serialPortParity = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SerialPortPrinter.prototype, "stopBits", {
            get: function () {
                return this._serialPortStopBits;
            },
            set: function (value) {
                this._serialPortStopBits = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SerialPortPrinter.prototype, "dataBits", {
            get: function () {
                return this._serialPortDataBits;
            },
            set: function (value) {
                this._serialPortDataBits = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SerialPortPrinter.prototype, "flowControl", {
            get: function () {
                return this._serialPortFlowControl;
            },
            set: function (value) {
                this._serialPortFlowControl = value;
            },
            enumerable: true,
            configurable: true
        });
        SerialPortPrinter.prototype.serialize = function () {
            var SEP = "|";
            if (!this.portName)
                throw "The specified serial port name is null or empty.";
            return this.Id + this.portName + SEP +
                this.baudRate + SEP +
                this.dataBits + SEP +
                this.flowControl + SEP +
                this.parity + SEP +
                this.stopBits;
        };
        return SerialPortPrinter;
    }());
    JSPM.SerialPortPrinter = SerialPortPrinter;
    var NetworkPrinter = (function () {
        function NetworkPrinter(port, ipAddress, dnsName) {
            this.Id = String.fromCharCode(4);
            this._networkIPAddress = "0.0.0.0";
            this._networkPort = 0;
            this._dnsName = "";
            if (!(ipAddress || dnsName))
                throw "You have to specify an IP address or a DNS name";
            if (ipAddress)
                this._networkIPAddress = ipAddress;
            if (dnsName)
                this._dnsName = dnsName;
            this._networkPort = port;
        }
        Object.defineProperty(NetworkPrinter.prototype, "dnsName", {
            get: function () {
                return this._dnsName;
            },
            set: function (value) {
                this._dnsName = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetworkPrinter.prototype, "ipAddress", {
            get: function () {
                return this._networkIPAddress;
            },
            set: function (value) {
                this._networkIPAddress = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetworkPrinter.prototype, "port", {
            get: function () {
                return this._networkPort;
            },
            set: function (value) {
                if (!(value >= 0 && value <= 65535))
                    throw "Invalid Port Number";
                this._networkPort = Math.floor(value);
            },
            enumerable: true,
            configurable: true
        });
        NetworkPrinter.prototype.serialize = function () {
            var SEP = "|";
            if (!(this.dnsName || this.ipAddress))
                throw "You have to specify an IP address or a DNS name";
            return this.Id + this.dnsName + SEP + this.ipAddress + SEP + this.port;
        };
        return NetworkPrinter;
    }());
    JSPM.NetworkPrinter = NetworkPrinter;
    var UserSelectedPrinter = (function () {
        function UserSelectedPrinter() {
            this.Id = String.fromCharCode(5);
        }
        UserSelectedPrinter.prototype.serialize = function () {
            return this.Id;
        };
        return UserSelectedPrinter;
    }());
    JSPM.UserSelectedPrinter = UserSelectedPrinter;
})(JSPM || (JSPM = {}));
var JSPM;
(function (JSPM) {
    var FileSourceType;
    (function (FileSourceType) {
        FileSourceType[FileSourceType["Base64"] = 0] = "Base64";
        FileSourceType[FileSourceType["Text"] = 1] = "Text";
        FileSourceType[FileSourceType["BLOB"] = 2] = "BLOB";
        FileSourceType[FileSourceType["URL"] = 3] = "URL";
    })(FileSourceType = JSPM.FileSourceType || (JSPM.FileSourceType = {}));
    ;
    var WSStatus;
    (function (WSStatus) {
        WSStatus[WSStatus["Open"] = 0] = "Open";
        WSStatus[WSStatus["Closed"] = 1] = "Closed";
        WSStatus[WSStatus["BlackListed"] = 2] = "BlackListed";
        WSStatus[WSStatus["WaitingForUserResponse"] = 3] = "WaitingForUserResponse";
    })(WSStatus = JSPM.WSStatus || (JSPM.WSStatus = {}));
    ;
    var PrintRotation;
    (function (PrintRotation) {
        PrintRotation[PrintRotation["None"] = 3] = "None";
        PrintRotation[PrintRotation["Rot90"] = 5] = "Rot90";
        PrintRotation[PrintRotation["Rot180"] = 6] = "Rot180";
        PrintRotation[PrintRotation["Rot270"] = 4] = "Rot270";
    })(PrintRotation = JSPM.PrintRotation || (JSPM.PrintRotation = {}));
    var TextAlignment;
    (function (TextAlignment) {
        TextAlignment[TextAlignment["Left"] = 0] = "Left";
        TextAlignment[TextAlignment["Center"] = 1] = "Center";
        TextAlignment[TextAlignment["Right"] = 2] = "Right";
        TextAlignment[TextAlignment["Justify"] = 3] = "Justify";
    })(TextAlignment = JSPM.TextAlignment || (JSPM.TextAlignment = {}));
    var PrintOrientation;
    (function (PrintOrientation) {
        PrintOrientation[PrintOrientation["Portrait"] = 0] = "Portrait";
        PrintOrientation[PrintOrientation["Landscape"] = 1] = "Landscape";
    })(PrintOrientation = JSPM.PrintOrientation || (JSPM.PrintOrientation = {}));
})(JSPM || (JSPM = {}));
(function (JSPM) {
    var Serial;
    (function (Serial) {
        var Parity;
        (function (Parity) {
            Parity[Parity["None"] = 0] = "None";
            Parity[Parity["Odd"] = 1] = "Odd";
            Parity[Parity["Even"] = 2] = "Even";
            Parity[Parity["Mark"] = 3] = "Mark";
            Parity[Parity["Space"] = 4] = "Space";
        })(Parity = Serial.Parity || (Serial.Parity = {}));
        var StopBits;
        (function (StopBits) {
            StopBits[StopBits["None"] = 0] = "None";
            StopBits[StopBits["One"] = 1] = "One";
            StopBits[StopBits["Two"] = 2] = "Two";
            StopBits[StopBits["OnePointFive"] = 3] = "OnePointFive";
        })(StopBits = Serial.StopBits || (Serial.StopBits = {}));
        var Handshake;
        (function (Handshake) {
            Handshake[Handshake["None"] = 0] = "None";
            Handshake[Handshake["RequestToSend"] = 1] = "RequestToSend";
            Handshake[Handshake["RequestToSendXOnXOff"] = 2] = "RequestToSendXOnXOff";
            Handshake[Handshake["XOnXOff"] = 3] = "XOnXOff";
        })(Handshake = Serial.Handshake || (Serial.Handshake = {}));
    })(Serial = JSPM.Serial || (JSPM.Serial = {}));
})(JSPM || (JSPM = {}));
var JSPM;
(function (JSPM) {
    var JSPMWebSocket = (function () {
        function JSPMWebSocket(addr, port, secure, auto_reconnect) {
            if (addr === void 0) { addr = "localhost"; }
            if (port === void 0) { port = 22443; }
            if (secure === void 0) { secure = true; }
            if (auto_reconnect === void 0) { auto_reconnect = false; }
            this._job_list = [];
            this.autoReconnect = false;
            this.onClose = function (e) { };
            this.onOpen = function (e) { };
            this.onStatusChanged = function () { };
            this._addr = addr;
            this._port = port;
            this._secure = secure;
            this.autoReconnect = auto_reconnect;
        }
        Object.defineProperty(JSPMWebSocket.prototype, "address", {
            get: function () {
                return this._addr;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JSPMWebSocket.prototype, "port", {
            get: function () {
                return this._port;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JSPMWebSocket.prototype, "isSecure", {
            get: function () {
                return this._secure;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JSPMWebSocket.prototype, "status", {
            get: function () {
                return this._status;
            },
            enumerable: true,
            configurable: true
        });
        JSPMWebSocket.prototype._onOpen = function (e, __this) {
            this._status = JSPM.WSStatus.WaitingForUserResponse;
            this._pingPong();
            __this.onStatusChanged();
            __this.onOpen(e);
        };
        JSPMWebSocket.prototype._onMessage = function (e, job_list) {
            try {
                var json_data = JSON.parse(e.data);
                var job = job_list[json_data.id];
                if (!job)
                    throw "Job " + json_data.id + "doesn't exist";
                delete job_list[json_data.id];
                job.ok(json_data.data);
            }
            catch (_a) {
                throw "Malformed message. Error: " + e.data;
            }
        };
        JSPMWebSocket.prototype._onError = function (e) {
            try {
                var json_data = JSON.parse(e);
                var job = this._job_list[json_data.id];
                if (!job)
                    throw e;
                job.error(e);
            }
            catch (_a) {
                throw e;
            }
        };
        JSPMWebSocket.prototype._pingPong = function () {
            var _this = this;
            setInterval(function (_) {
                if (_this._status != JSPM.WSStatus.Open)
                    return;
                _this.send("ping");
            }, 30000);
        };
        JSPMWebSocket.prototype._onClose = function (e, __this) {
            var _this = this;
            if (e.code == 403)
                this._status = JSPM.WSStatus.BlackListed;
            else {
                this._status = JSPM.WSStatus.Closed;
                if (this.autoReconnect)
                    setTimeout(function (_) {
                        _this.start();
                    }, 2000);
            }
            __this.onClose(e);
            __this.onStatusChanged();
        };
        JSPMWebSocket.prototype._genID = function () {
            return Math.floor((1 + Math.random()) * 0x100000000)
                .toString(16)
                .substring(1);
        };
        JSPMWebSocket.prototype._send = function (data, params, ok, err) {
            do {
                var id = this._genID();
            } while (this._job_list[id]);
            this._job_list[id] = {
                id: id,
                ok: ok,
                error: err
            };
            var _data = {};
            if (data instanceof Blob) {
                var job_id = new Uint8Array(("id" + id).split("").map(function (a) { return a.charCodeAt(0); }));
                _data = new Blob([data, job_id]);
            }
            else if (typeof data == "string") {
                if ("id" in params) {
                    params["_id"] = params["id"];
                    delete params["id"];
                }
                if ("data" in params) {
                    params["_data"] = params["data"];
                    delete params["data"];
                }
                _data = { id: id, data: data };
                for (var param in params) {
                    _data[param] = params[param];
                }
                _data = JSON.stringify(_data);
            }
            else {
                delete this._job_list[id];
                _data = data;
            }
            this._ws.send(_data);
        };
        JSPMWebSocket.prototype.start = function () {
            var _this = this;
            return new Promise(function (ok, err) {
                try {
                    _this._ws = new WebSocket((_this._secure ? "wss://" : "ws://") + _this._addr + ":" + _this._port);
                    _this._ws.onclose = function (e) { return _this._onClose(e, _this); };
                    _this._ws.onerror = function (i) {
                        err(i);
                    };
                    _this._ws.onopen = function (i) {
                        _this._ws.onopen = function (e) { return _this._onOpen(e, _this); };
                        if (JSPM.JSPrintManager.cache_license_at_start) {
                            JSPM.JSPrintManager.cacheLicense(JSPM.JSPrintManager.license_url);
                        }
                        _this._ws.onmessage = function (e) {
                            if (e.data == "CONNECTED") {
                                _this._status = JSPM.WSStatus.Open;
                                _this.onStatusChanged();
                                _this.onOpen(null);
                                _this._ws.onmessage = function (e) { return _this._onMessage(e, _this._job_list); };
                            }
                        };
                        _this._ws.onerror = _this._onError;
                        ok();
                    };
                }
                catch (e) {
                    if (_this.autoReconnect)
                        setTimeout(function () {
                            _this.start()
                                .then(ok)
                                .catch(err);
                        }, 2000);
                    else
                        err(e);
                }
            });
        };
        JSPMWebSocket.prototype.send = function (data, params) {
            var _this = this;
            if (params === void 0) { params = {}; }
            return new Promise(function (ok, err) {
                if (_this._status == JSPM.WSStatus.Closed)
                    err("The WebSocket connection is closed");
                else if (_this._status == JSPM.WSStatus.BlackListed)
                    err("The site is blacklisted and the connection was closed");
                else if (_this._ws.readyState != _this._ws.OPEN)
                    err("The WebSocket isn't ready yet");
                _this._send(data, params, ok, err);
            });
        };
        JSPMWebSocket.prototype.stop = function () {
            this._ws.close();
            this._ws = null;
        };
        return JSPMWebSocket;
    }());
    JSPM.JSPMWebSocket = JSPMWebSocket;
})(JSPM || (JSPM = {}));
var JSPM;
(function (JSPM) {
    var JSPrintManager = (function () {
        function JSPrintManager() {
        }
        JSPrintManager.start = function (secure, host, port) {
            if (secure === void 0) { secure = true; }
            if (host === void 0) { host = "localhost"; }
            if (port === void 0) { port = 22443; }
            if (!this.WS)
                this.WS = new JSPM.JSPMWebSocket(host, port, secure, this.auto_reconnect);
            return this.WS.start();
        };
        JSPrintManager.getPrinters = function () {
            var _this = this;
            return new Promise(function (ok, err) {
                _this.WS.send("get_printers")
                    .then(function (data) {
                    var list = data.split("|");
                    ok(list);
                })
                    .catch(function (e) {
                    err(e);
                });
            });
        };
        JSPrintManager.getPrintersInfo = function () {
            var _this = this;
            return new Promise(function (ok, err) {
                _this.WS.send("info_printers")
                    .then(function (data) {
                    ok(JSON.parse(data));
                })
                    .catch(function (e) {
                    err(e);
                });
            });
        };
        JSPrintManager.cacheLicense = function (url) {
            var _this = this;
            if (url === void 0) { url = ""; }
            if (url == "") {
                url = window.location.origin + "/jspm";
            }
            return new Promise(function (ok, err) {
                _this.WS.send("cache_license", { url: url })
                    .then(function (_) {
                    ok();
                })
                    .catch(function (e) {
                    err(e);
                });
            });
        };
        Object.defineProperty(JSPrintManager, "websocket_status", {
            get: function () {
                return this.WS ? this.WS.status : JSPM.WSStatus.Closed;
            },
            enumerable: true,
            configurable: true
        });
        JSPrintManager.showAbout = function () {
            return this.WS.send("about");
        };
        JSPrintManager.updateClient = function () {
            return this.WS.send("update");
        };
        JSPrintManager.stop = function () {
            this.WS.stop();
        };
        JSPrintManager.auto_reconnect = false;
        JSPrintManager.license_url = "";
        JSPrintManager.cache_license_at_start = true;
        return JSPrintManager;
    }());
    JSPM.JSPrintManager = JSPrintManager;
})(JSPM || (JSPM = {}));
var JSPM;
(function (JSPM) {
    var PrintFile = (function () {
        function PrintFile(fileContent, fileContentType, fileName, copies) {
            this.fileName = "";
            this._copies = 1;
            this.fileContent = fileContent;
            this.fileContentType = fileContentType;
            if (!fileName)
                throw "You must specify a FileName including the extension.";
            this.fileName = fileName;
            if (copies)
                this.copies = copies;
            this.escapeInvalidFileNameChars();
        }
        Object.defineProperty(PrintFile.prototype, "copies", {
            get: function () {
                return this._copies;
            },
            set: function (value) {
                if (value < 1)
                    throw "Copies must be greater than or equal to 1.";
                this._copies = value;
            },
            enumerable: true,
            configurable: true
        });
        PrintFile.prototype.escapeInvalidFileNameChars = function () {
            if (this.fileName.indexOf("\\") > -1)
                this.fileName = this.fileName.replace("\\", "BACKSLASHCHAR");
        };
        PrintFile.prototype.bool2str = function (value, true_val, false_val) {
            if (true_val === void 0) { true_val = '1'; }
            if (false_val === void 0) { false_val = '0'; }
            return value ? true_val : false_val;
        };
        PrintFile.prototype.serialize = function () {
            var _this = this;
            return new Promise(function (ok, err) {
                switch (_this.fileContentType) {
                    case JSPM.FileSourceType.Base64:
                        {
                            ok(new zip.Data64URIReader(_this.fileContent));
                        }
                        break;
                    case JSPM.FileSourceType.BLOB:
                        {
                            ok(new zip.BlobReader(_this.fileContent));
                        }
                        break;
                    case JSPM.FileSourceType.Text:
                        {
                            ok(new zip.TextReader(_this.fileContent));
                        }
                        break;
                    case JSPM.FileSourceType.URL:
                        {
                            var xhr_1 = new XMLHttpRequest();
                            xhr_1.open('GET', _this.fileContent, true);
                            xhr_1.responseType = 'blob';
                            xhr_1.onload = function (oEvent) {
                                ok(new zip.BlobReader(xhr_1.response));
                            };
                            xhr_1.send(null);
                        }
                        break;
                    default: err("The file content type is invalid");
                }
            });
        };
        return PrintFile;
    }());
    JSPM.PrintFile = PrintFile;
})(JSPM || (JSPM = {}));
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var JSPM;
(function (JSPM) {
    var PrintFilePDF = (function (_super) {
        __extends(PrintFilePDF, _super);
        function PrintFilePDF(fileContent, fileContentType, fileName, copies) {
            var _this = _super.call(this, fileContent, fileContentType, fileName.substring(0, fileName.lastIndexOf('.')) + '.wpdf', copies) || this;
            _this.printAsGrayscale = false;
            _this.printAnnotations = false;
            _this.printRange = '';
            _this.printInReverseOrder = false;
            _this.printRotation = JSPM.PrintRotation.None;
            return _this;
        }
        PrintFilePDF.prototype.isValidRange = function (range) {
            if (range == null || range == '')
                return true;
            var reg = /([0-9])+((-[0-9]+)|(,[0-9]+))*/;
            var test = reg.exec(range);
            if (test == null)
                return false;
            if (test[0].length != range.length)
                return false;
            return true;
        };
        PrintFilePDF.prototype.getBLOBContent = function () {
            var _this = this;
            return new Promise(function (ok, err) {
                switch (_this.fileContentType) {
                    case JSPM.FileSourceType.BLOB:
                        {
                            ok(_this.fileContent);
                        }
                        break;
                    case JSPM.FileSourceType.Base64:
                        {
                            try {
                                var chars = atob(_this.fileContent);
                                var bytes = new Uint8Array(chars.length);
                                for (var i = 0; i < chars.length; i++) {
                                    bytes[i] = chars.charCodeAt(i);
                                }
                                ok(new Blob([bytes]));
                            }
                            catch (e) {
                                err('Error trying to decode the base64 data.\n' + e);
                            }
                        }
                        break;
                    case JSPM.FileSourceType.Text:
                        {
                            try {
                                var bytes = new Uint8Array(_this.fileContent.length);
                                for (var i = 0; i < _this.fileContent.length; i++) {
                                    bytes[i] = _this.fileContent.charCodeAt(i);
                                }
                                ok(new Blob([bytes]));
                            }
                            catch (e) {
                                err('Error trying to decode the text data.\n' + e);
                            }
                        }
                        break;
                    case JSPM.FileSourceType.URL:
                        {
                            var xhr_2 = new XMLHttpRequest();
                            xhr_2.open('GET', _this.fileContent, true);
                            xhr_2.responseType = 'blob';
                            xhr_2.onload = function (oEvent) {
                                ok(xhr_2.response);
                            };
                            xhr_2.send(null);
                        }
                        break;
                    default: err('FileSourceType not specified');
                }
            });
        };
        PrintFilePDF.prototype.serialize = function () {
            var _this = this;
            return new Promise(function (ok, err) {
                var SEP = ';';
                if (!_this.isValidRange(_this.printRange))
                    err('Invalid Print Range');
                _this.getBLOBContent().then(function (file_content) {
                    var params_arr = new Uint8Array((_this.bool2str(_this.printAsGrayscale) +
                        _this.bool2str(_this.printAnnotations) +
                        _this.bool2str(_this.printInReverseOrder) +
                        _this.printRotation + SEP + _this.printRange)
                        .split('').map(function (x) {
                        return x.charCodeAt(0);
                    }));
                    var blob = new Blob([file_content, params_arr]);
                    ok(new zip.BlobReader(blob));
                }).catch(function (e) {
                    err(e);
                });
            });
        };
        return PrintFilePDF;
    }(JSPM.PrintFile));
    JSPM.PrintFilePDF = PrintFilePDF;
})(JSPM || (JSPM = {}));
var JSPM;
(function (JSPM) {
    var PrintFileTXT = (function (_super) {
        __extends(PrintFileTXT, _super);
        function PrintFileTXT(fileContent, fileName, copies) {
            var _this = _super.call(this, fileContent, JSPM.FileSourceType.Text, fileName.substring(0, fileName.lastIndexOf('.')) + '.wtxt', copies) || this;
            _this.textContent = '';
            _this.textAligment = JSPM.TextAlignment.Left;
            _this.fontName = '';
            _this.fontBold = false;
            _this.fontItalic = false;
            _this.fontUnderline = false;
            _this.fontStrikethrough = false;
            _this.fontSize = 10;
            _this.fontColor = '#000000';
            _this.printOrientation = JSPM.PrintOrientation.Portrait;
            _this.marginLeft = 0.5;
            _this.marginRight = 0.5;
            _this.marginTop = 0.5;
            _this.marginBottom = 0.5;
            return _this;
        }
        PrintFileTXT.prototype.serialize = function () {
            var _this = this;
            return new Promise(function (ok, err) {
                var SEP = '|';
                var params = _this.printOrientation + SEP + _this.textAligment +
                    SEP + _this.fontName + SEP + _this.fontSize + SEP +
                    _this.bool2str(_this.fontBold) + SEP +
                    _this.bool2str(_this.fontItalic) + SEP +
                    _this.bool2str(_this.fontUnderline) + SEP +
                    _this.bool2str(_this.fontStrikethrough) + SEP +
                    _this.fontColor + SEP + _this.marginLeft + SEP + _this.marginTop +
                    SEP + _this.marginRight + SEP + _this.marginBottom + '\n';
                ok(new zip.TextReader(params + _this.fileContent));
            });
        };
        return PrintFileTXT;
    }(JSPM.PrintFile));
    JSPM.PrintFileTXT = PrintFileTXT;
})(JSPM || (JSPM = {}));
//# sourceMappingURL=JSPrintManager.js.map

(function() {
    if (typeof define === 'function' && define.amd) {
        define(JSPM);
    } else if (typeof exports === 'object') {
        module.exports = JSPM;
    } else {
        window.JSPM = JSPM;
    }
})();