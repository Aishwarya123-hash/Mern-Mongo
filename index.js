
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import connectDB from './db.js';
import Movie from './movies/Movie.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, 'public')));

// Seed initial movies
const initialMovies = [
    { title: 'The Matrix', genre: 'Sci-Fi', year: 1999, rating: 8.7 },
    { title: 'Inception', genre: 'Sci-Fi', year: 2010, rating: 8.8 },
    { title: 'Interstellar', genre: 'Sci-Fi', year: 2014, rating: 8.6 },
    { title: 'Macbeth', genre: 'Tragedy', year: 2015, rating: 6.6 },
    { title: 'Hamlet', genre: 'Tragedy', year: 1996, rating: 7.7 },
    { title: 'Requiem for a Dream', genre: 'Tragedy', year: 2000, rating: 8.3 },
    { title: 'The Godfather', genre: 'Crime', year: 1972, rating: 9.2 },
    { title: 'Goodfellas', genre: 'Crime', year: 1990, rating: 8.7 },
    { title: 'Pulp Fiction', genre: 'Crime', year: 1994, rating: 8.9 },
    { title: 'Titanic', genre: 'Romance', year: 1997, rating: 7.9 },
    { title: 'The Notebook', genre: 'Romance', year: 2004, rating: 7.8 },
    { title: 'Pride and Prejudice', genre: 'Romance', year: 2005, rating: 7.8 }
];

async function seedDatabase() {
    const count = await Movie.countDocuments();

    if (count === 0) {
        await Movie.insertMany(initialMovies);
        console.log('Successfully added 12 movies!');
    }
}

// HTML Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.get('/newmovie', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'newmovie.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'contact.html'));
});

// GET all movies and search movies
app.get('/api/movies', async (req, res) => {
    try {
        const { title, genre } = req.query;
        const filter = {};

        if (title) {
            filter.title = { $regex: title, $options: 'i' };
        }

        if (genre) {
            filter.genre = { $regex: genre, $options: 'i' };
        }

        const movies = await Movie.find(filter);

        res.status(200).json({
            success: true,
            count: movies.length,
            data: movies
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST - Add new movie
app.post('/api/movies', async (req, res) => {
    try {
        const { title, genre, year, rating } = req.body;

        const movie = await Movie.create({
            title,
            genre,
            year,
            rating
        });

        res.status(201).json({
            success: true,
            data: movie
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// PUT - Update movie
app.put('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        res.json({
            success: true,
            data: movie
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE - Delete movie
app.delete('/api/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        res.json({
            success: true,
            message: 'Movie deleted successfully'
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Start server after database connection
async function startServer() {
    try {
        await connectDB();
        await seedDatabase();

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
}

startServer();
