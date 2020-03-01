 FROM ubuntu:18.04

# packages

RUN apt-get update && apt-get install -y python3-pip gnupg2

RUN echo "deb http://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.0.list
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 68818C72E52529D4

ENV TZ=Europe/Minsk
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && echo "12" | apt-get install -y mongodb-org libmupdf-dev mupdf

RUN pip3 install --upgrade pip
RUN pip3 install flask PyMuPDF pymongo

RUN mkdir /mongodatabase/
ADD html/ /html/
ADD static/ /static/
ADD pdfs/ /pdfs/
ADD ssl/  /ssl/
ADD PDFImporter.py /
ADD PDFDoggyServer.py /
ADD start.sh /
ENTRYPOINT ["/bin/sh", "start.sh"]
