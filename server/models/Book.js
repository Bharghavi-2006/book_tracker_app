const mongoose = require('mongoose');
//loads Mongoose so we can connect to MongoDB using a URI
//we'll use it to define the bookSchema 

const bookSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    genre: { type: String, required: true },
    completionStatus: {
        pagesRead: { type: Number, default: 0 },
        totalPages: { type: Number, required: true }
    },
    isCompleted: { type: Boolean, default: false},
    rating: { type: Number, min: 1, max: 5 },
    remarks: { type: String }
});
/* mongoose will auto-create a books collection. 
userId connects this book to the user.
completionStatus lets us track progress.
rating, remarks are optional. */

module.exports = mongoose.model('Book', bookSchema);
//exporting the model so that it can be used in other files
