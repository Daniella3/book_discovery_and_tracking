const db = require('../config/db');

exports.logActivity = (req, res) => {
    const { user_id, activity_type, activity_data } = req.body;

    const query = 'INSERT INTO user_activity (user_id, activity_type, activity_data) VALUES (?, ?, ?)';
    db.query(query, [user_id, activity_type, JSON.stringify(activity_data)], (err) => {
        if (err) {
            console.error('Error logging activity:', err);
            return res.status(500).json({ error: 'Failed to log activity' });
        }
        res.status(201).json({ message: 'Activity logged'});
    });
};
