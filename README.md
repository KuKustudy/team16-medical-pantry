# Recall Guard 🧘‍♀️🔆

This is a web application called 'Recall Guard', it aims to streamline the identification and removal of recalled medical products, ensuring timely compliance and safeguard patient well-being.

Recall Guard utilizes optical character recognition (OCR) technology to simplify the recall check process. Users can simply photograph a medical item's label; The application automatically extracts key identifying text and cross-references it in real-time with official regulatory databases (e.g., FDA, TGA) to instantly determine its recall status.
<br>

## Technology Stack:
Frontend: React

Backend: Node.js + Express.js + EasyOCR

Database: [MongoDB](https://www.mongodb.com/)

Authentication: [Clerk](https://clerk.com/)

Testing: Jest(backend) + Vitest(frontend)

<br>

## 🖥️ How to Run Frontend

1. **Clone the repository**
   ```bash
   git clone https://github.com/KuKustudy/team16-medical-pantry.git
   
2. **Navigate to the Frontend directory**
   ```bash
   cd Frontend

3. **Download necessary libraries to run the application**
   ```bash
   npm install

4. **Run the Frontend**
   ```bash
   npm run dev

5. **Frontend server is running on 5173 local port now, open a new window in your browser and go the below directory:**
   ```bash
   localhost:5173
<br>

## 🛠️ how to run backend:

1. **Clone the repository (only if you haven't clone it yet)**
   ```bash
   git clone https://github.com/KuKustudy/team16-medical-pantry.git
   
2. **Navigate to the Frontend directory**
   ```bash
   cd backend

3. **Download necessary libraries to run the application**
   ```bash
   npm install

4. **Run the Backend**
   ```bash
   npm run dev

5. **Backend server is running on 8080 local port now, open a new window in your browser and go the below directory:**
   ```bash
   localhost:8080/api
<br>


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





