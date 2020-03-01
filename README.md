# PDFDoggy
Tool to help you query the text of multiple PDFs

## Quickstart
Copy your pdfs into the `pdfs` folder and make sure that you consolidate the files into folders within the pdfs directory.
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

Then open http://localhost:8181 in your browser (hopefully not Internet Explorer) and try out the system. 
