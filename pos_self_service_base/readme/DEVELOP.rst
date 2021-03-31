Generate JavaScript bundle file
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This module makes use of the NPM library IPP to send http request to CUPS.
The NPM library browserify is used to generate a bundle.js file from the print.js file::

    npm -i ipp
    npm -g browserify
    browserify static/src/js/print.js -o static/src/js/bundle.js
