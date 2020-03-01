#!/bin/sh/
/usr/bin/mongod --fork --syslog --dbpath /mongodatabase/ && /usr/bin/python3 /PDFImporter.py && /usr/bin/python3 /PDFDoggyServer.py
