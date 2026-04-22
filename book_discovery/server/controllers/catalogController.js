const openLibraryService = require('../services/openLibraryService');

const dedupeBooks = (books) => {
    const seen = new Set();

    return books.filter((book) => {
        const key = `${book.title}::${(book.authors || []).join(',')}`.toLowerCase();

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
};

exports.searchBooks = async (req, res) => {
    const query = String(req.query.q || '').trim();
    const maxResults = Number(req.query.maxResults) || 20;

    if (!query) {
        return res.json([]);
    }

    try {
        const openLibraryBooks = await openLibraryService.searchBooks({ query, limit: maxResults });
        return res.json(dedupeBooks(openLibraryBooks).slice(0, maxResults));
    } catch (error) {
        console.error('Error searching catalog books:', error.message);
        res.status(error.statusCode || 500).json({ error: 'Failed to search books' });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const book = await openLibraryService.getBookById(req.params.id);

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(book);
    } catch (error) {
        console.error('Error fetching Open Library book details:', error.message);
        res.status(error.statusCode || 500).json({ error: 'Failed to fetch book details' });
    }
};
