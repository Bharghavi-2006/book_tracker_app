async function fetchBooks() {
    const token = localStorage.getItem('token'); //get the JWT token from browser storage
    const genre = document.getElementById('genreFilter').value; //get genre filter value (text input)
    const completed = document.getElementById('completedFilter').ariaChecked; //get completed checkbox status

    let url = '/api/books/filter?'; 
    if (genre) url += `genre=${genre}&`; //add ?genre=Fantasy or whatever if filled
    if (completed) url += `completed=true`; //add &completed=true if checkbox ticked

    const res = await fetch(url, {
        headers: { Authorization: token }
    });
    /*Send GET request to the URL (/api/books/filter?...)
    Attach the JWT token in the Authorization header so the backend knows which user is requesting */

    const books = await res.json(); //convert response object into a JS object (array of books returned by backend)
    const list = document.getElementById('book-list');
    list.innerHTML = ""; //adding divs which represent each book returned in a proper format

    books.forEach(book => {
        const div = document.createElement('div');
        div.innerHTML = `
          <h3>${book.title} (${book.genre})</h3>
          <p>${book.completionStatus.pagesRead} / ${book.completionStatus.totalPages}
          <p>Remarks: ${book.remarks || "None"}</p>
          <p>Rating: ${book.rating || "Not rated"}</p>
          <button onclick="updatePages('${book._id}')">Update Progress</button>
          <button onclick="deleteBook('${book._id}')">Delete</button>
          <hr/>
        `;
        list.appendChild(div);
    });
}

async function deleteBook(id) {
    const token = localStorage.getItem('token'); //gets JWT token
    await fetch(`/api/books/${id}`, { //sends a delete request to DELETE /api/books/<book_id>
        method: 'DELETE',
        headers: { Authorization: token }
    });
    fetchBooks(); //calls fetchBooks() again so the updated list (without the deleted list is shown)
}

async function updatePages(id) {
  const token = localStorage.getItem('token');

  const pagesInput = prompt("How many pages have you read?");
  if (!pagesInput || isNaN(pagesInput)) {
    alert("Please enter a valid number for pages read.");
    return;
  }

  const ratingInput = prompt("Update rating (1–5, leave blank to skip):");
  const remarksInput = prompt("Update remarks (leave blank to skip):");

  const updatedData = {
    completionStatus: {
      pagesRead: Number(pagesInput)
    }
  };

  // Only add if user entered something
  if (ratingInput && !isNaN(ratingInput)) updatedData.rating = Number(ratingInput);
  if (remarksInput) updatedData.remarks = remarksInput;

  const res = await fetch(`/api/books/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify(updatedData)
  });

  if (res.ok) {
    alert("Book updated successfully!");
    fetchBooks();
  } else {
    const msg = await res.text();
    alert("Failed to update book: " + msg);
  }

  fetchBooks();
}


window.onload = fetchBooks; //as soon as window loads to user dashboard fetchBooks function should be implemented

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'home.html';
}

const addBookForm = document.getElementById('add-book-form');
addBookForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');

  const newBook = {
    title: document.getElementById('title').value,
    genre: document.getElementById('genre').value,
    completionStatus: {
      totalPages: Number(document.getElementById('totalPages').value),
      pagesRead: Number(document.getElementById('pagesRead').value)
    },
    rating: Number(document.getElementById('rating').value),
    remarks: document.getElementById('remarks').value
  };

  const res = await fetch('/api/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify(newBook)
  });

  if (res.ok) {
    alert("Book added!");
    addBookForm.reset();
    fetchBooks();
  } else {
    const msg = await res.text();
    alert("Failed to add book: " + msg);
  }
});

