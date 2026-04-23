const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT) || 5001;
const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    'http://localhost:5173',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Book Discovery API is running' });
});

const readingListRoutes = require('./routes/readingList');
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activity');
const recommendationsRoutes = require('./routes/recommendations');
const catalogRoutes = require('./routes/catalog');

app.use('/api/reading-list', readingListRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/catalog', catalogRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.post("/test", (req, res) => {
    console.log("TEST HIT");
    res.json({ message: "Test works" });
});
