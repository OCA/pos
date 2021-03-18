global.yoprint = () => console.log("yo");

const ipp = require("../static/src/lib/ipp");

let poem = `Listen to yourself,
to the subtle flows
of emotion, desire
coursing through your body.
You need not conform
to any boxes, any borders.
Desires overflow
these simple lines
designed
to control,
to contain.
Love yourself,
what you bring to the world.
Voices may say,
"You're not good enough,
you're not doing it right."
They speak
from anger
from fear.
You need not hold
these words
in your belly.
Let them go,
when you are ready.
Practice yourself;
do what moves you.
Feel your breath, your body.
Touch your heart.
Caress your skin.
Take in the touch you need
of wind and water,
earth and sun,
food and drink,
hands and mouths.
`;

poem = `You do not have to be good.
You do not have to walk on your knees
For a hundred miles through the desert,
    repenting.
You only have to let the soft animal of
    your body
love what it loves.
Tell me about your despair, yours, and
    I will tell you mine.
Meanwhile the world goes on.
Meanwhile the sun and the clear pebbles
    of the rain
are moving across the landscapes,
over the prairies and the deep trees,
the mountains and the rivers.
Meanwhile the wild geese, high in the
    clean blue air,
are heading home again.
Whoever you are, no matter how lonely,
the world offers itself to your
    imagination,
calls to you like the wild geese,
    harsh and exciting --
over and over announcing your place
in the family of things.`

var lines = poem.split(/\r?\n/).slice(0, 13);
var lines2 = poem.split(/\r?\n/).slice(13, 26);
var lines3 = poem.split(/\r?\n/).slice(26, 34);

const zplLines = lines
    .map(
        (line, index) => `^FO0,${index * 13 + 30} ^A0,13
^FD ${line}^FS
`
    )
    .join("");
const zplLines2 = lines2
    .map(
        (line, index) => `^FO0,${index * 13 + 30} ^A0,13
^FD ${line}^FS
`
    )
    .join("");
const zplLines3 = lines3
    .map(
        (line, index) => `^FO0,${index * 13 + 30} ^A0,13
^FD ${line}^FS
`
    )
    .join("");

const wrappedLines = `
^XA
^PW250
${zplLines3}

^XZ
^XA
^PW250
${zplLines2}

^XZ
^XA
^PW250
${zplLines}

^XZ`;
console.log(wrappedLines);

// var doc = Buffer.from(wrappedLines);
var doc = Buffer.from("^XA ^FD ^FS  ^XZ")

var printer = ipp.Printer("http://localhost:8631/printers/ZTC-ZD420-203dpi-ZPL");
var msg = {
    "operation-attributes-tag": {
        "requesting-user-name": "William",
        "job-name": "My Test Job",
        "document-format": "text/plain",
    },
    data: doc,
};

global.printZebra = () => {
    console.log("sending print job to zebra...");
    printer.execute("Print-Job", msg, function (err, res) {
        console.log(res);
    });
};
