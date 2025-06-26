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
    div.className = 'book-card';
    div.setAttribute('data-book-id', book._id);
    div.setAttribute('data-total-pages', book.completionStatus.totalPages || '');
    div.setAttribute('data-pages-read', book.completionStatus.pagesRead || '');
    div.setAttribute('data-rating', book.rating || '');
    div.setAttribute('data-remarks', book.remarks || '');

    div.innerHTML = `
      <h3>${book.title} (${book.genre})</h3>
      <p>${book.completionStatus.pagesRead} / ${book.completionStatus.totalPages}</p>
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

// 🆕 New function to show the form for updating progress
function updatePages(bookId) {
  // Scroll to the book card or form container
  setTimeout(() => {
    const form = document.getElementById('update-modal');
    if (form) {
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);

  const book = document.querySelector(`[data-book-id="${bookId}"]`);
  const totalPages = book.getAttribute('data-total-pages');
  const pagesRead = book.getAttribute('data-pages-read');
  const rating = book.getAttribute('data-rating');
  const remarks = book.getAttribute('data-remarks');

  document.getElementById('update-bookId').value = bookId;
  document.getElementById('update-totalPages').value = totalPages || '';
  document.getElementById('update-pagesRead').value = pagesRead || '';
  document.getElementById('update-rating').value = rating || '';
  document.getElementById('update-remarks').value = remarks || '';

  document.getElementById('update-error').textContent = '';
  document.getElementById('update-modal').style.display = 'block';
}

function closeUpdateForm() {
  document.getElementById('update-modal').style.display = 'none';
}

// 🆕 New form handler for updating a book
document.getElementById('update-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');

  const bookId = document.getElementById('update-bookId').value;
  const pagesRead = Number(document.getElementById('update-pagesRead').value);
  const totalPages = Number(document.getElementById('update-totalPages').value);
  const rating = Number(document.getElementById('update-rating').value);
  const remarks = document.getElementById('update-remarks').value;

  if (pagesRead > totalPages) {
    document.getElementById('update-error').textContent = "Pages read cannot be more than total pages!";
    return;
  }

  const updatedData = {
    completionStatus: { pagesRead, totalPages }
  };
  if (!isNaN(rating)) updatedData.rating = rating;
  if (remarks) updatedData.remarks = remarks;

  const res = await fetch(`/api/books/${bookId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify(updatedData)
  });

  if (res.ok) {
    alert("Book updated!");
    closeUpdateForm();
    fetchBooks();
  } else {
    const msg = await res.text();
    document.getElementById('update-error').textContent = "Update failed: " + msg;
  }

  // After `fetchBooks()` is called and DOM is updated...
  setTimeout(() => {
    const lastCard = document.querySelector('.book-card:last-child');
    if (lastCard) {
      lastCard.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100); // delay to wait for DOM updates

});

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
    alert("Book added! Scroll down to check!");
    addBookForm.reset();
    fetchBooks();
  } else {
    const msg = await res.text();
    alert("Failed to add book: " + msg);
  }

  // After `fetchBooks()` is called and DOM is updated...
  setTimeout(() => {
    const lastCard = document.querySelector('.book-card:last-child');
    if (lastCard) {
      lastCard.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100); // delay to wait for DOM updates

});
