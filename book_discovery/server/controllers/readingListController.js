const db = require('../config/db');

exports.addBook = (req, res) => {
    const userId = req.user?.userId;
    const { google_book_id, title, author, thumbnail } = req.body;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const existingQuery = 'SELECT id FROM reading_list WHERE user_id = ? AND google_book_id = ? LIMIT 1';

    db.query(existingQuery, [userId, google_book_id], (existingErr, existingResults) => {
        if (existingErr) {
            console.error('Error checking for existing book:', existingErr);
            return res.status(500).json({ error: 'Failed to add book to reading list' });
        }

        if (existingResults.length > 0) {
            return res.status(200).json({ message: 'Book already in reading list', bookId: existingResults[0].id });
        }

        const query = 'INSERT INTO reading_list (user_id, google_book_id, title, author, thumbnail) VALUES (?, ?, ?, ?, ?) RETURNING id';
        db.query(query, [userId, google_book_id, title, author, thumbnail], (err, result) => {
            if (err) {
                console.error('Error adding book to reading list:', err);
                return res.status(500).json({ error: 'Failed to add book to reading list' });
            }
            res.status(201).json({ message: 'Book added to reading list', bookId: result.insertId });
        });
    });
}    

exports.getReadingList = (req, res) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = 'SELECT * FROM reading_list WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching reading list:', err);
            return res.status(500).json({ error: 'Failed to fetch reading list' });
        }
        res.json(results);
    });
};

exports.deleteBook = (req, res) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = 'DELETE FROM reading_list WHERE id = ? AND user_id = ?';
    db.query(query, [id, userId], (err, result) => {
        if (err) {
            console.error('Error deleting book from reading list:', err);
            return res.status(500).json({ error: 'Failed to delete book from reading list' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({ message: 'Book deleted from reading list' });
    });
};

exports.updateStatus = (req, res) => {
    const { id } = req.params;
    const { status, progress } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const updates = [];
    const values = [];

    if (status) {
        updates.push('status = ?');
        values.push(status);
    }

    if (progress !== undefined) {
        const parsedProgress = Number(progress);

        if (Number.isNaN(parsedProgress) || parsedProgress < 0 || parsedProgress > 100) {
            return res.status(400).json({ error: 'Progress must be a number between 0 and 100' });
        }

        updates.push('progress = ?');
        values.push(parsedProgress);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
    }

    const query = `UPDATE reading_list SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
    values.push(id, userId);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating book:', err);
            return res.status(500).json({ error: 'Failed to update book' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({ message: 'Book updated' });
    });
};
