const jwt = require('jsonwebtoken');
//loading the jsonwebtoken library

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization; //checks for token in the authorization header

    if (!token) return res.status(401).send("Access Denied: No token provided");

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET); //decodes and verifies token signature
        req.user = verified; //stores decoded token data into request object
        next(); //moves to the next function in the route
    } catch (err) {
        res.status(400).send("Invalid Token"); //exports it for use in routes
    }
};
/* when we created jwt token in routes/auth.js and call it later here again as jwt.verify(token, secret)
it decodes that token and gives us _id and iat.
that's what we attach to the req.user.
From this point forward, any route using this middleware can access req.user._id to know who is making the request */

module.exports = verifyToken;
//exports it for use in routes 