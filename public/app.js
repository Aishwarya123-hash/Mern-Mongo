
const movieList = document.getElementById('movieList');
const message = document.getElementById('message');

// Display movies
async function loadMovies() {
    if (!movieList) return;

    const title = document.getElementById('searchTitle')?.value || '';
    const genre = document.getElementById('searchGenre')?.value || '';

    try {
        const params = new URLSearchParams({ title, genre });

        const response = await fetch(`/api/movies?${params}`);
        const result = await response.json();

        movieList.innerHTML = '';

        if (!result.success || result.data.length === 0) {
            movieList.innerHTML =
                '<tr><td colspan="5">No movies found</td></tr>';
            return;
        }

        result.data.forEach(movie => {
            const row = document.createElement('tr');

            const values = [
                movie.title,
                movie.genre,
                movie.year,
                movie.rating
            ];

            values.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionCell = document.createElement('td');

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-btn';
            editButton.addEventListener('click', () => editMovie(movie));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.addEventListener('click', () => deleteMovie(movie._id));

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);

            row.appendChild(actionCell);
            movieList.appendChild(row);
        });

    } catch (error) {
        movieList.innerHTML =
            '<tr><td colspan="5">Unable to load movies</td></tr>';
        console.error(error);
    }
}

// Clear search
function clearSearch() {
    document.getElementById('searchTitle').value = '';
    document.getElementById('searchGenre').value = '';
    loadMovies();
}

// Add movie
const movieForm = document.getElementById('movieForm');

if (movieForm) {
    movieForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const movie = {
            title: document.getElementById('title').value.trim(),
            genre: document.getElementById('genre').value,
            year: Number(document.getElementById('year').value),
            rating: Number(document.getElementById('rating').value)
        };

        try {
            const response = await fetch('/api/movies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(movie)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Unable to add movie');
            }

            document.getElementById('message').textContent =
                'Movie added successfully!';

            movieForm.reset();

            setTimeout(() => {
                window.location.href = '/';
            }, 1000);

        } catch (error) {
            document.getElementById('message').textContent = error.message;
        }
    });
}

// Edit movie
async function editMovie(movie) {
    const title = prompt('Enter movie title:', movie.title);

    if (title === null || !title.trim()) return;

    const genre = prompt('Enter genre:', movie.genre);
    if (genre === null || !genre.trim()) return;

    const year = prompt('Enter release year:', movie.year);
    if (year === null) return;

    const rating = prompt('Enter rating:', movie.rating);
    if (rating === null) return;

    try {
        const response = await fetch(`/api/movies/${movie._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title.trim(),
                genre: genre.trim(),
                year: Number(year),
                rating: Number(rating)
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Update failed');
        }

        alert('Movie updated successfully!');
        loadMovies();

    } catch (error) {
        alert(error.message);
    }
}

// Delete movie
async function deleteMovie(id) {
    const confirmDelete = confirm(
        'Are you sure you want to delete this movie?'
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(`/api/movies/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Delete failed');
        }

        alert('Movie deleted successfully!');
        loadMovies();

    } catch (error) {
        alert(error.message);
    }
}

// Load movies when homepage opens
if (movieList) {
    loadMovies();
}
