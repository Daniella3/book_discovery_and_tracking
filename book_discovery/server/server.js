const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT) || 5001;

app.use(cors());
app.use(express.json());

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
