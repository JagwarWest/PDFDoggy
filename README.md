# PDFDoggy
Tool to help you query the text of multiple PDFs

## Quickstart
This quickstart shows how you can quickly setup PDFDoggy to work with your PDFs.
Create a folder `pdfs` at the directory with the `Dockerfile` and then copy your pdfs into the `pdfs` folder and make sure that you consolidate the files into folders within the pdfs directory.
These folders will be the `categories` used in the queries.

For example, the structure should look like this:
```
pdfs
├── Lecture1
│   ├── Chapter01.pdf
│   └── Chapter02.pdf
└── Lecture2
    ├── Slides-01.pdf
    └── Slides-02.pdf
```
In this example `Lecture1` and `Lecture2` are going to be the `categories` used in the queries.

Once the pdfs are in place, we can start building our docker container, e.g., like this:

`docker build -t pdfdoggy .`

`docker run -it --net host --name pdfdoggy pdfdoggy`

Running the docker container automatically imports the PDFs in the `pdfs` directory into the database.
Then open http://localhost:8181 in your browser (hopefully not Internet Explorer) and try out the system. 
