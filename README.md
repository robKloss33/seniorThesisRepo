# Senior Thesis Repo: Document Parse and Search Web Application

## Software Requirements Specification for a Document Parse and Search Web Application

## Introduction

### Purpose
The purpose of this document is to outline the functional and non-functional requirements of a web application that can handle document parsing. This project specification will explain the basic features and goals of the app.

The key goals of the new system are:
- Allow users to quickly and easily upload and parse documents
- Create a simple data for easy retrieval from other devices
- Provide a simple and easy solution for creating static webpages

### Scope
This system is intended to support anyone who would like to upload documents to create a static webpage. The system will handle:
- User registration and login
- Document upload and parsing
- Easy access to previously handled data 
- Search and export parcels of data

### Definitions, Acronyms, and Abbreviations
- **Document**: File containing text, likely pdf, doc, or txt.
- **Key term**: Any word or phrase entered for search by the user. This is what the user is trying to find in the documents.

## Overview
The Document Parsing Web Application is a web-based platform designed to simplify document parsing and data storage. It allows users to build a collection of parsed data for easy export.

### System Features:
1. **User Login and Registration**: Ensures users have access to only their data. Anyone who is not a user may register an account with the system.
2. **Data Upload**: Users can upload a variety of files that will be broken down for and stored.
3. **Data Storage and Access**: Data from documents is stored and only accessible by the orginal user.
4. **Data Search**: Users can search their uploaded data by key terms. A count of all matches will be shown. The data will be displayed by orginal document title with the search word/phrase bolded in the context of a sentence/phrase. If there is no sentence/phrase, the search term will be displayed with a page number. 
5. **Data Download**: Parcels can be downloaded by search term in a text file.

The system is designed with to allow users to access from a variety fo devices for easy search and retrieval. 

The following sections detail the specific use cases that the system will support, describing how users will interact with the system. 

## Use Cases

### Use Case 1.1: Account Registration
- **Actors**: User
- **Overview**: Actor creates an account with user name and password.

**Typical Course of Events**:
1. Page prompts to sign in or register.
2. User selects register.
3. Page prompts for username and password.
4. User enters their username and password and hits enter/register.
5. System verifies that the username is available and password is valid.

**Alternative Courses**:
- **Step 5**: Username is not available and/or password is not valid.
  1. Displays error.
  2. Go back to step 1.

### Use Case 1.2: Secure Login
- **Actors**: User
- **Overview**: Actor uses username and password to verify identity.

**Typical Course of Events**:
1. Page prompts to sign in or register.
2. User selects sign in.
3. Page prompts for username and password.
4. User enters their username and password and hits enter/register.
5. System verifies that the username and password are valid.

**Alternative Courses**:
- **Step 5**: Username and/or password are not valid.
  1. Displays error.
  2. Go back to step 1.

### Use Case 1.3: Search by key term
- **Actors**: User
- **Overview**: User searches their data by a key term.

**Typical Course of Events**:
1. Run Use Case 1.2, *Secure Login*.
2. Displays list of previously uploaded documents.
3. User selects one more documents.
4. User types in a key term.
5. Data is diplayed for the key term by document.
6. Data is available for download

**Alternative Courses**:
- Any step: User can start a new search at any time
  1. User clicks "start new search."
  2. Go back to step 2.
- Step 5: No matches found
  1. An error is displayed.
  2. Return to step 4. 

### Use Case 1.4: Upload a Document
- **Actors**: User
- **Overview**: User uploads a document.

**Typical Course of Events**:
1. Run Use Case 1.2, *Secure Login*.
2. User selects button to upload a new document.
3. User is prompted to drag/select document.
4. Display document successfully uploaded

**Alternative Courses**:
- **Step 4**: Document fails to upload
  1. Displays an error message.
  2. Return to step 2.

### Use Case 1.5: Download a Document
- **Actors**: User
- **Overview**: User wants to download after a search.

**Typical Course of Events**:
1. Run Use Case 1.3, *Search by Key Term*.
2. User selects button to download data.
3. Data is written to a document.
4. Display document available for download.

**Alternative Courses**:
- **Step 4**: Download failed
  1. Displays an error message.
  2. Return to step 2.
