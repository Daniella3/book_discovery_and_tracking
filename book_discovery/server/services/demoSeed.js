const db = require('../config/db');

const DEMO_BOOKS = [
    {
        google_book_id: 'OL554614W',
        title: 'On the Way to the Wedding',
        author: 'Julia Quinn',
        thumbnail: 'https://covers.openlibrary.org/b/id/27790-L.jpg',
        status: 'reading',
        progress: 4,
    },
    {
        google_book_id: 'OL21745884W',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        thumbnail: 'https://covers.openlibrary.org/b/id/12308319-L.jpg',
        status: 'reading',
        progress: 62,
    },
    {
        google_book_id: 'OL1168083W',
        title: 'Nineteen Eighty-Four',
        author: 'George Orwell',
        thumbnail: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
        status: 'finished',
        progress: 100,
    },
    {
        google_book_id: 'OL66554W',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        thumbnail: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
        status: 'finished',
        progress: 100,
    },
    {
        google_book_id: 'OL27482W',
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        thumbnail: 'https://covers.openlibrary.org/b/id/15223072-L.jpg',
        status: 'want_to_read',
        progress: 0,
    },
    {
        google_book_id: 'OL18139176W',
        title: 'Educated',
        author: 'Tara Westover',
        thumbnail: 'https://covers.openlibrary.org/b/id/8755322-L.jpg',
        status: 'want_to_read',
        progress: 0,
    },
    {
        google_book_id: 'OL17930368W',
        title: 'Atomic Habits',
        author: 'James Clear',
        thumbnail: 'https://covers.openlibrary.org/b/id/15217381-L.jpg',
        status: 'want_to_read',
        progress: 0,
    },
];

const DEMO_SEARCHES = ['mythic fantasy', 'space survival', 'memoir'];

const seedDemoAccount = async (userId) => {
    const bookValues = [];
    const bookParams = [];

    DEMO_BOOKS.forEach((book) => {
        bookValues.push('(?, ?, ?, ?, ?, ?, ?)');
        bookParams.push(
            userId,
            book.google_book_id,
            book.title,
            book.author,
            book.thumbnail,
            book.status,
            book.progress
        );
    });

    await db.query(
        `INSERT INTO reading_list (user_id, google_book_id, title, author, thumbnail, status, progress)
         VALUES ${bookValues.join(', ')}`,
        bookParams
    );

    const activityValues = [];
    const activityParams = [];

    DEMO_SEARCHES.forEach((query) => {
        activityValues.push('(?, ?, ?)');
        activityParams.push(userId, 'search', JSON.stringify({ query }));
    });

    await db.query(
        `INSERT INTO user_activity (user_id, activity_type, activity_data)
         VALUES ${activityValues.join(', ')}`,
        activityParams
    );
};

module.exports = {
    seedDemoAccount,
};
