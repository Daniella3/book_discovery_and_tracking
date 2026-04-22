const db = require('../config/db');

const fetchBooks = (...args) => {
    if (typeof global.fetch === 'function') {
        return global.fetch(...args);
    }

    return import('node-fetch').then(({ default: fetch }) => fetch(...args));
};

exports.getRecommendations = async (req, res) => {
    const { userId } = req.params;

    const query = `SELECT activity_data FROM user_activity WHERE user_id = ? AND activity_type = 'search' ORDER BY created_at DESC LIMIT 5`;
    db.query(query, [userId], async (err, results) => {
        if (err) {
            console.error('Error fetching user activity:', err);
            return res.status(500).json({ error: 'Failed to fetch user activity' });
        }

        const searches = results
            .map((row) => {
                try {
                    return JSON.parse(row.activity_data).query;
                } catch (parseError) {
                    return null;
                }
            })
            .filter(Boolean);

        if (searches.length === 0) {
            return res.json([]);
        }

        const combinedQuery = searches.join(' ');

        try {
            const response = await fetchBooks(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(combinedQuery)}&maxResults=10`);

            if (!response.ok) {
                throw new Error(`Google Books request failed with status ${response.status}`);
            }

            const data = await response.json();
            res.json(data.items || []);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            res.status(500).json({ error: 'Failed to fetch recommendations' });
        }
    });
};
