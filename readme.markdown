# test-browser-charsets

This is a subproject of [httpinvoke](https://npmjs.org/package/httpinvoke).
It is a web developers' tool.

Helps find out which web browsers recognize Byte Order Marks in XMLHttpRequest.responseText with which XMLHttpRequest.overrideMimeType argument.
Shows which byte-order marks were forcibly recognized - files with that BOM byte sequence will have mangled XMLHttpRequest.responseText.
Those files are forcibly interpreted as text files, thus you will not be able to download them as binary files.
This is irrelevant to Internet Explorer, because it has XMLHttpRequest.responseBody and also the browsers which implement the XMLHttpRequest2.

It is a client-server webapp.
Server is implemented using just  without any dependencies.
Client is plain JavaScript.

## Running

No dependencies are needed, except a working installation of [NodeJS](http://nodejs.org).
Tested on v0.10.x.

    node src/server

## Conclusions

* Firefox-based browsers have some charsets that make the BOM ignored: x-user-defined, ibm866, iso-8859-2, etc.
* WebKit-based browsers always parse the BOM.
