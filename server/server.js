require('dotenv').config(); 
//loads variables from a .env file into our Node.js environment
//this keeps secrets like DB URI and JWT keys out of the codebase
const express = require('express'); 
//loads the express.js framework so we can create web servers, define routes and handle requests and responses.
//Core of our backend logic 
const mongoose = require('mongoose'); 
//loads Mongoose so that we can connect to MongoDB using a URI
//define schemas/models for interacting with the database
const cors = require('cors');
/* CORS = Cross-Origin Resource Sharing
When the frontend (like localhost: 3000) makes a request to a backend (like localhost: 5000),
browsers block it due to security policy as they have different origins
Enablings CORS allows backend to accept these requests safely */

const app = express();
//creates an Express application instance (core engine of backend server)
//we can now use app to define routes and middleware.
app.use(express.json());
//tells express whenever we receive a request with a JSON body, automatically parse it and make it available as req.body
//without this, req.body would be undefined
app.use(cors());
/*cors() is a function provided by cors module.
When we call cors(), it returns a middleware function.
app.use() is how we add middleware to Express.
app.use(cors()) is saying add this CORS-handling middleware function to the Express app. */
const path = require('path');

app.use(express.static(path.join(__dirname, '..', 'public')));
console.log("Serving frontend from:", path.join(__dirname, '..', 'public'));
//serve any file inside the /public folder directly in the browser

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => console.log("Server running"));
});
/* mongoose.connect() is a promise. It tries to connect to MongoDB if the connection is successful it resolves. If it fails it rejects and we can catch it with .catch().
The code inside .then() only runs if the connection is successful.
We dont want the server to start until MongoDB is connected. 
app.listen() just starts the server, not a promise so there's no .then() and it takes a callback function instead */

app.get('/', (req, res) => res.send("Book Tracker API"));
/* app.get() sets up a GET route. 
'/' is the URL path for that route (the root). 
(req, res) => is a callback function that handles the request. 
req is the incoming request object. 
res is the outgoing response object.
res.send() sends a simple message back to whoever made the request */

const authRoutes = require('./routes/auth');
//loading a file called auth.js (no need to specify .js as Node automatically assumes that) from the routes folder which must export a router (express.Router())
//so now authRoutes is now an Express router instance that contains all our /signup and /login logic
app.use('/api/auth', authRoutes);
//take all the routes defined in authRoutes and mount them under the path /api/auth
//the actual route path becomes POST /api/auth/signup. 
//technically using app.use() to plug in something like middleware but not for authentication or anything this is for routing

const bookRoutes = require('./routes/book');
//loading a file called book.js (no need to specify .js as Node automatically assumes that) from the routes folder which must export a router (express.Router())
//so now bookRoutes is now an Express router instance that contains all the CRUD operations we wanna perform on our book list
app.use('/api/books', bookRoutes);
//take all the routes defined in bookRoutes and mount them under the path /api/books
//the actual route path becomes POST /api/book/filter. 
//technically using app.use() to plug in something like middleware but not for authentication or anything this is for routing

app.get('/', (req, res) => {
  res.redirect('/home.html');
});
