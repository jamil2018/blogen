## Running the application

1. Download the project files from the git repository.
2. Open the terminal run the following command: `npm install`
3. After the node module installation finishes, create a .env file in project root directory.
4. The .env file requires the following variables to be present:
   - **PORT**: Defines the port in which the server will run
   - **NODE_ENV**: Defines the node environment the application is currently running in. [Options: PRODUCTION, DEVELOPMENT]
   - **MONGO_URI**: Defines a MongoDB Atlas URI to access the application database
   - **JWT_SECRET**: Defines the JWT_SECRET word for json web tokens
   - **FILE_UPLOAD_PATH**: Defines the file upload path for the multer middleware to store uploaded files
5. Your are ready to go. Please use the scripts in the **Available Scripts** section to run the server.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the production mode.\
Use [http://localhost:8000](http://localhost:8000) as the base URL to send requests to the API.

### `npm run dev`

Runs the app in development mode using nodemon. The server automatically restarts once you make changes to it.
