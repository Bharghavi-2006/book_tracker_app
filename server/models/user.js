const mongoose = require('mongoose');
//loads Mongoose so that we can connect to MongoDB using a URI
//define schemas/models for interacting with the database
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true},
    totalBooks: { type: Number, default: 0},
    completedBooks: { type: Number, default: 0}
});
module.exports = mongoose.model("User", userSchema);
/* mongoose.model("User", userSchema) registers a model named "User" using userSchema.
"User" becomes the name of our collection in MongoDB.
userSchema is the structure/shape (like a blueprint) that your documents in that collection must follow.
I want to create a collection named users, and every item in it should match the userSchema.
module.exports = ... exports the model so you can use it in other files.
User is an object you can use to create users, save them to DB, find users, update, delete etc. */ 