import app from "./src/app.js";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    try {
        console.log(`Server is running on port ${PORT}✅`);
    }
    catch (error) {
        console.log('error occured in server', error.message);
    }
});
