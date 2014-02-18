# test-browser-charsets

Find out which web browsers recognize Byte Order Marks in XMLHttpRequest.responseText with which XMLHttpRequest.overrideMimeType argument.

- [Overview](#overview)
- [Installation](#installation)
- [CLI](#cli)
- [Development](#development)

## Overview

* It is a client-server webapp. Server is implemented using just  without any dependencies. Client is plain JavaScript.
* It is a web developers' tool.
* It was useful in development of [httpinvoke](https://www.npmjs.org/package/httpinvoke).
* Helps find out which web browsers recognize Byte Order Marks in XMLHttpRequest.responseText with which XMLHttpRequest.overrideMimeType argument.
* Shows which byte-order marks were forcibly recognized - files with that BOM byte sequence will have mangled XMLHttpRequest.responseText.  Those files are forcibly interpreted as text files, thus you will not be able to download them as binary files.  This is irrelevant to Internet Explorer, because it has XMLHttpRequest.responseBody and also the browsers which implement the XMLHttpRequest2.
* Conclusions:
  * Firefox-based browsers have some charsets that make the BOM ignored: x-user-defined, ibm866, iso-8859-2, etc.
  * WebKit-based browsers always parse the BOM.

## Installation

  Install with [npm](https://www.npmjs.org/package/test-browser-charsets):

    $ npm install --global test-browser-charsets

## CLI

  Run:

    $ test-browser-charsets

## Development

    TODO
