const router = require('express').Router();
/* loading the Router class from Express.
it lets us organize routes into separate files (instead of putting everything inside app.js or server.js).
It keeps routes organized and express.Router() creates a new router instance */
const User = require('../models/user');
//we're going up one directory finding the models folder and loading user.js
//what is exactly happening is The require function reads the whole file, checks what we're trying to export from the file, and gets the model from the file and assigns it to the variable
const bcrypt = require('bcryptjs');
//loads the bcrypt library used for hashing passwords
const jwt = require('jsonwebtoken');
//loads the jsonwebtoken (JWT) library which we'll use for generating JWT tokens 

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Optional: You can do a pre-check if you want better UX
  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(400).send("Username already taken");
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });

  try {
    await user.save();
    res.send("User created");
  } catch (err) {
    res.status(500).send("Error creating user");
  }
});

/* router.post is an API endpoint that gets called when the signup form is submitted.
So when frontend sends a POST request to /signup, this code runs. It's triggered on form submit.
bcrypt.hash(password, 10) means password is hashed using 10 salt rounds. 
This makes it computationally expensive for attackers to guess passwords.
new User is created using the username and the hashed password which gets saved in the database. 
Then we send a response like User created */

router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).send("Invalid");
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(401).send("Wrong pass");
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
});
/*router.post is an API endpoint that gets triggered when the login form is submitted.
We can find the user with username from req.body.
If user doesnt exist, return Invalid, sends a 400 Bad Request
Compare entered password with hashed password from DB using bcrypt.compare which does the hashing + comparison
If not valid, return 401 unauthorized.
Then generate a JWT token and return it to the broswer.
The frontend should store this token and send it on every protected request */

module.exports = router;
//exports the module so that we can use it in other files


