#!/bin/sh/
/usr/bin/mongod --fork --syslog --dbpath /mongodatabase/

FILE=/pdfdoggy.info
if test -f "$FILE";
then
    echo "$FILE exist -> no data import needed"
else
    /usr/bin/python3 /PDFImporter.py
    touch /pdfdoggy.info
fi

/usr/bin/python3 /PDFDoggyServer.py