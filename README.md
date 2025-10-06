# PDFEmbedder - Document Processing Application

## Project Overview

This web application allows users to processing HTML and PDF files, creating vector embeddings for them and storing them in a database. This will allow for later use when used as input data for machine learning models.

## How to Use

- npm install typescript will NEED to be ran on both the ocr and embed servers before npm run dev
- npm install -g vite will need to be ran on the client directory 
- npm install will need to be ran on the server directory

## Core Features Implemented

1. **Job Processing System**
   - Users can initiate processing jobs for URLs of their choosing
   - Multiple URLs can be processed simultaneously
   - Jobs support both HTML and PDF document types
   - Job progress is tracked with granular status updates

2. **Real-time Updates**
   - WebSocket implementation for live job status updates
   - Updates are pushed from server to client without polling
   - Detailed progress tracking during document processing stages

3. **HTML Document Processing**
   - Fetching and parsing of HTML documents
   - Extraction of text nodes
   - Text cleaning and chunking
   - Generation of embedding vectors for each chunk
   - Display of full HTML, extracted text, and embedding data

4. **PDF Document Processing**
   - Fetching and loading of PDF documents
   - Conversion to images for visualization (Not actually implemented the pdf2pic / pdf-img-converter/ canvas all did not work)
   - OCR processing of page content
   - Per-page text chunking
   - Generation of embedding vectors for each chunk
   - Display of page images, extracted text, and embedding data (once again not real images)

### Additional Features

5. **Document Groups System**
   - Creation of named document groups
   - Hierarchical group structure with parent-child relationships
   - Child groups inherit parent relationships

6. **Document Organization**
   - User interface for document curation
   - Easy assignment of documents to groups
   - Visual representation of group hierarchies

## Technical Implementation

### Architecture

The application is built as a full-stack JavaScript/TypeScript application with a clear separation between client and server components:

- **Frontend**: React-based SPA with TypeScript
- **Backend**: Express.js API server with MongoDB as requested
- **Real-time Communication**: WebSocket implementation for live updates
- **Processing Pipeline**: Modular document processing services


### Processing Pipeline

The document processing pipeline follows a clear sequence of operations:
1. **Job Creation**: User submits URL(s) with document type (HTML/PDF)
2. **Document Fetching**: Server retrieves the document from the provided URL
3. **Content Extraction**: Different strategies for HTML and PDF documents
   - HTML: Cheerio-based parsing extracts text nodes
   - PDF: Page-by-page processing with image generation and OCR
4. **Chunking**: Text is divided into semantic chunks
5. **Embedding Generation**: Vector representations created for each chunk
6. **Storage**: Results saved to MongoDB with references to the original job


## Technical Challenges and Solutions

- **PDF to IMG** : I was unable to convert the pdf pages to images despite attempting with pdf2pic, pdf-img-converter and many other methods. This did not affect this project since it just pasted out lorem ipsum, but in the future that will need to be fixed in order to use the site.  


## Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS, Axios, WebSockets
- **Backend**: Node.js, Express, TypeScript, WebSockets, MongoDB/Mongoose
- **Document Processing**: Cheerio (HTML parsing), PDF.js (PDF processing)
- **Build/Dev Tools**: Vite, ESLint, TypeScript

## Conclusion

This document processing application successfully implements all but one of the minimum requirements and several additional features specified in the assignment. The application provides a robust platform for processing documents.

