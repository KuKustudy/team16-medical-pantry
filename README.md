# Recall Guard 🧘‍♀️🔆

This is a web application called 'Recall Guard', it aims to streamline the identification and removal of recalled medical products, ensuring timely compliance and safeguard patient well-being.

Recall Guard utilizes optical character recognition (OCR) technology to simplify the recall check process. Users can simply photograph a medical item's label; The application automatically extracts key identifying text and cross-references it in real-time with official regulatory databases (e.g., FDA, TGA) to instantly determine its recall status.

## Technology Stack:
Frontend: React

Backend: Node.js + Express.js + EasyOCR

Database: MongoDB Atlas


## 🖥️ how to run frontend:

    1. cd to the Frontend directory

    2. open terminal 

    3. enter command: npm i 

    4. then enter command: npm run dev

    5. backend server is running on 5173 port now, go to localhost:5173 to test it out


## 🛠️ how to run backend:

    1. cd to the backend directory

    2. open terminal

    3. enter command: npm i 

    4. then enter command: npm run dev

    5. backend server is running on 8080 port now, go to localhost:8080/api to test it out


## how to test frontend:

    1. go to frontend directory

    2. open terminal

    3. enter command: npm run test

## How to set up the database:

1. Sign up or log in to [mongodb.com](mongodb.com).

2. Create your Atlas database, as described in the [MongoDB documentation](https://www.mongodb.com/docs/get-started/?language=nodejs).

3. Once you have created a cluster, go to the overview page and click "Connect".

4. Choose your security settings.

5. Proceed to connection method section and choose drivers, and select node.js, version 6.7 or later as your driver.

5. Follow the instructions until you are presented with a connection string, and then copy the string.

6. In the Backend Folder, create a file called ".env".

7. In the file, enter the following.
```
DATABASE_URL= <The connection string>
DATABASE_NAME= <The name of your database>
RECALL_COLLECTION= <The name of the collection that you will keep your recalls in>
IS_EXPOSED=false
```
You should now be able to connect to your database from within Recall Guard.

## use of AI declaration:

    During the development of this project, we have made use of ChatGPT to assist our codings.
    Example prompts that we have used:

    Prompt 1: can you explain how this piece of code work? [attached the code we have found online tutorial]
    Use 1: we used the output to help us understand what the code does and how the code can be applied in our project.
    
    Prompt 2: currently for like lot numbers it's extract as string regex the string for numbers turn the regex return back into a string from an array push the object with the lot number back into the return list and I need to access it while it's still an array right after the regex but then I need everything else in the return list to also be an array so I'll need to turn everything into a string from an array at the end better solution for this in js.
    Use 2: we used the output to have an initial idea of what should be the workflow for extracting lot numbers from an array of string.
    
    Prompt 3: would puppeteer be able to scrape the results from https://www.tga.gov.au/how-we-regulate/monitoring-safety-and-shortages/procedure-recalls-product-alerts-and-product-corrections-prac/database-recalls-product-alerts-and-product-corrections-drac
    Use 3: we used the output to understand the feasibility of scaping a government website, combined it with the research we done online to make an informed decision.

## Reference links:

FDA: Food & Drug Administration, an United State organisation, their website 
can be accessed on https://www.fda.gov/

TGA: Therapeutic Goods Administration, Australian Government agency, their
website can be accessed on https://www.tga.gov.au/

HOW to set up test using Vitest: https://victorbruce82.medium.com/vitest-with-react-testing-library-in-react-created-with-vite-3552f0a9a19a

HOW to automatically test your code using GitHub Action: 
https://www.youtube.com/watch?v=JUKZVlIDrtY




