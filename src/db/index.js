import { connect } from 'mongoose';
import { DB_NAME } from '../contants.js';

export const connectDB = async () => {
    try {
        const instance = await connect(`${process.env.MONGODB_URI_2}/${DB_NAME}`);
       
        console.log(instance.connection.readyState);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};