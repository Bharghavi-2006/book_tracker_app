const router = require('express').Router();
//assigning Router class from express framework to the router variable
const Book = require('../models/Book');
/* ".."signifies going up one directory then we get the models folder
in the models folder we're using the Book.js file no need to specify .js as Node automatically does that.
the require function looks for the export which is being returned from the file and imports it into this file */
const verify = require('../middleware/auth');
//imports token-verifying middleware so we can protect routes
//importing process works the same way as above

//Create a new book
router.post('/', verify, async (req, res) => {
    const book = new Book({ ...req.body, userId: req.user._id });
    await book.save();
    res.status(201).json(book);
});
/* router.post is the API endpoint which gets triggered when a person clicks on some button like create new book
The route will be / then we'll plug it in with app.use() and the full route becomes /api/books.
Verify is a middleware. It checks the JT and attaches decoded user data (like _id) to req.user
We create a new Book with the req.body and also add userId from token.
We merge form data with the secure userId from the token */

//Get all books for the user
router.get('/', verify, async (req, res) => {
    const books = await Book.find({ userId: req.user._id });
    res.json(books);
})
/* GET API endpoint at /api/books.
It's protected using the verify middleware. 
It finds all books where the userId filed matches the currently logged-in user's ID (which we get from req.user._id)
It then sends those books back in JSON format using res.json(books). */

//Filter by genre or completion
router.get('/filter', verify, async (req, res) => {
    const query = { userId: req.user._id };

    if (req.query.genre) query.genre = req.query.genre;
    if (req.query.completed === 'true') {
        query.isCompleted = true;
    }

    const filtered = await Book.find(query);
    res.json(filtered);
});
/* We want to allow user to filter their books based on genre and whether the book is completed or not (i.e, pagesRead === totalPages)
Route is protected by JWT (verify).
Called like this GET /api/books/filter?genre=Fantasy&completed=true
const query is creating the base filter. It says only fetch books belonging to the logged-in user
All other filters will add on top of this.
if (req.query.genre) query.genre = req.query.genre refers to the URL parameters like ?genre=Fantasy.
So if I visit /api/books/filter?genre=Fantasy then req.query.genre === 'Fantasy'
if (req.query.completed === 'true') checks if the URL has completed=true
If it does, goal is to only return fully-read books where pagesRead === totalPages
Book.find(query) fetches books matching filters
res.json(filtered) returns filtered books in JSON */

// Update book progress, rating, remarks safely
router.put('/:id', verify, async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, userId: req.user._id });

  if (!book) return res.status(404).send("Book not found");

  // Only update what's provided
  const updates = {};

  if (req.body.completionStatus?.pagesRead !== undefined) {
    updates['completionStatus.pagesRead'] = req.body.completionStatus.pagesRead;

    // Also update isCompleted if totalPages is defined
    if (book.completionStatus.totalPages && req.body.completionStatus.pagesRead >= book.completionStatus.totalPages) {
      updates.isCompleted = true;
    } else {
      updates.isCompleted = false;
    }
  }

  if (req.body.rating !== undefined) updates.rating = req.body.rating;
  if (req.body.remarks !== undefined) updates.remarks = req.body.remarks;

  // Safe update
  const updated = await Book.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: updates },
    { new: true }
  );

  res.json(updated);
});

/* Handles PUT /api/books/:id user wants to edit a book
verify is the JWT middleware 
req.params.id gets the book's ID from the URL
req.user._id gets the user ID from the JWT token
{ $set: req.body } updates whatever fields are sent in the request body
Whatever keys and values are inside req.body, those are updated in DB.
{ new: true } returns the updated document instead of old one.
Added allowedUpdates to make sure only some fields can be updated by the user so that MongoDB doesnt overwrite some other field which should not be altered by user */

//Delete a book
router.delete('/:id', verify, async (req, res) => {
    await Book.deleteOne({ _id: req.params.id, userId: req.user._id });
    const result = await Book.deleteOne({ _id: req.params.id, userId: req.user._id });

    if (result.deletedCount === 0) {
       return res.status(404).send("Book not found or not authorized");
    }

    res.send("Book deleted");
});
/* handles deletion of book.
Takes book ID from request URL(req.params.id)
the user ID from the JWT (req.user._id) and ensures the book being deleted actually belongs to the logged-in user.
If it matches, it deletes the book and returns a confirmation response. */

module.exports = router;
//exporting the router class so that it can be used in other files 
