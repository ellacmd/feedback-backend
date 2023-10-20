# feedback-backend

## **I. File Structure**
This is an Express application with a MongoDB datastore.

- Express app **entry-point** is ./app.js
- **./utils** folder contains utilities
- **./middlewares** folder contains middleware
- **./controllers** folder contains controllers
- **./models** contains models (Mongoose), controllers, and repositories
- **./routes** contains api routes (Express)

## **II. Branches**
* `main` - Code that is currently running in production

## **III. Build / Run Instructions**

### Prerequisites:
* Node.js (make sure to install node modules for each application)
* mongodb-community\* (optional; Only required for development)

1. Install all Node dependencies (Assuming Node is already installed on the machine)
```bash
# Should be run in the root of the application (where package.json is)
npm install
```

2. Start the application
  * Start mongodb-community if process.env.NODE_ENV === dev
```bash
# Should be ran from the correct folder
npm run <NODE_SCRIPT_NAME_HERE_DEPENDING_ON_ENVIRONMENT>  # i.e. npm run dev or npm run start
```

### Scripts
```json
"start": "node www/bin",
"dev": "nodemon www/bin"
```

These scripts can be executed with `npm run <script_name>` _ex. `npm run dev`
