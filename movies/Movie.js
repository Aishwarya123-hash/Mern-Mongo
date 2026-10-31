
import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    genre: {
        type: String,
        required: true
    },

    year: {
        type: Number,
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    }
});

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
