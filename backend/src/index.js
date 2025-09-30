import dotenv from "dotenv";
dotenv.config();

import connectDb from "./database/db.js";
import app from './app.js';

connectDb().then( () => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch(err => console.log(err));