 FROM ubuntu:18.04

# packages
RUN apt-get update && apt-get install -y python3-pip gnupg2 locales

# setup locales
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# setup mongodb package repo
RUN echo "deb http://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.0.list
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 68818C72E52529D4
RUN ln -snf /usr/share/zoneinfo/Europe/Minsk /etc/localtime && echo Europe/Minsk > /etc/timezone

# install mongodb
RUN apt-get update && apt-get install -y mongodb-org

# setup python env
RUN pip3 install --upgrade pip
RUN pip3 install flask PyMuPDF pymongo

# setup dir structure
RUN mkdir /mongodatabase/
RUN mkdir /pdfs/

COPY . /

ENTRYPOINT ["/bin/sh", "start.sh"]