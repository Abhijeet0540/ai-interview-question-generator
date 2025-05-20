import app from "./app.js";
import dotenv from 'dotenv';
import "./config/db.postgres.config.js";
dotenv.config();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    try {
        console.log(`Server is running on port ${PORT}✅`);
    }
    catch (error) {
        console.log('error occured in server', error.message);
    }
});
