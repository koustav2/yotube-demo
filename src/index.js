// require('dotenv').config({ path: './env' });
import dotenv from 'dotenv';
import { connectDB } from './db/index.js';
dotenv.config({ path: './env' });

connectDB();
/**
import express from 'express';
const app = express();
; (async () => {
    try {
        await connect(`${process.env.MONGODB_URI_2}/${DB_NAME}`);
        console.log('Connected to MongoDB');
        app.error("error", error => console.error(error));
        app.listen(process.env.PORT, () => console.log('Server started'));
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
})();
*/

