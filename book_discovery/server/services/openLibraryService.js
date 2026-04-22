const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';
const COVER_BASE_URL = 'https://covers.openlibrary.org/b';
const OPEN_LIBRARY_USER_AGENT = 'book-discovery/1.0 (local development)';

const fetchJson = (...args) => {
    if (typeof global.fetch === 'function') {
        return global.fetch(...args);
    }

    return import('node-fetch').then(({ default: fetch }) => fetch(...args));
};

const requestOpenLibrary = async (path) => {
    const response = await fetchJson(`${OPEN_LIBRARY_BASE_URL}${path}`, {
        headers: {
            'User-Agent': OPEN_LIBRARY_USER_AGENT,
        },
    });

    if (!response.ok) {
        const error = new Error(`Open Library request failed with status ${response.status}`);
        error.statusCode = response.status;
        throw error;
    }

    return response.json();
};

const getDescriptionText = (description) => {
    if (!description) {
        return '';
    }

    if (typeof description === 'string') {
        return description;
    }

    return description.value || '';
};

const getCoverUrl = (coverId) => {
    if (!coverId) {
        return 'https://via.placeholder.com/128x195?text=No+Image';
    }

    return `${COVER_BASE_URL}/id/${coverId}-L.jpg`;
};

const normalizeSearchDoc = (doc) => ({
    id: String(doc.key || '').split('/').pop(),
    provider: 'openlibrary',
    title: doc.title || 'No title available.',
    authors: doc.author_name?.length ? doc.author_name : ['Unknown Author'],
    description: doc.first_sentence?.[0] || 'No description available.',
    thumbnail: getCoverUrl(doc.cover_i),
    categories: doc.subject?.slice(0, 5) || ['Uncategorized'],
    publishedDate: doc.first_publish_year || 'Unknown',
    openLibraryKey: doc.key,
    isbn: doc.isbn?.[0] || null,
  });

const getFirstValue = (...values) => values.find((value) => {
    if (Array.isArray(value)) {
        return value.length > 0;
    }

    return Boolean(value);
});

const normalizeWork = (work, details = {}) => ({
    id: String(work.key || '').split('/').pop(),
    provider: 'openlibrary',
    title: work.title || 'No title available.',
    authors: details.authors?.length ? details.authors : ['Unknown Author'],
    description: getFirstValue(getDescriptionText(work.description), details.description) || 'No description available.',
    thumbnail: getCoverUrl(getFirstValue(work.covers?.[0], details.coverId)),
    categories: getFirstValue(work.subjects?.slice(0, 8), details.subjects?.slice(0, 8)) || ['Uncategorized'],
    publishedDate: getFirstValue(work.first_publish_date, details.publishedDate) || 'Unknown',
    openLibraryKey: work.key,
    isbn: details.isbn || null,
  });

const searchBooks = async ({ query, limit = 30 }) => {
    const data = await requestOpenLibrary(`/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
    return (data.docs || [])
        .filter((doc) => doc.key?.startsWith('/works/'))
        .map(normalizeSearchDoc);
};

const getBookById = async (id) => {
    const work = await requestOpenLibrary(`/works/${encodeURIComponent(id)}.json`);
    let editionDetails = {};

    try {
        const editions = await requestOpenLibrary(`/works/${encodeURIComponent(id)}/editions.json?limit=10`);
        const editionWithDetails = (editions.entries || []).find((edition) => (
            edition.description ||
            edition.publish_date ||
            edition.covers?.length ||
            edition.isbn_13?.length ||
            edition.isbn_10?.length ||
            edition.subjects?.length
        ));

        if (editionWithDetails) {
            editionDetails = {
                description: getDescriptionText(editionWithDetails.description),
                publishedDate: editionWithDetails.publish_date,
                coverId: editionWithDetails.covers?.[0],
                isbn: editionWithDetails.isbn_13?.[0] || editionWithDetails.isbn_10?.[0] || null,
                subjects: editionWithDetails.subjects || [],
            };
        }
    } catch {
        editionDetails = {};
    }

    let authors = [];
    if (Array.isArray(work.authors) && work.authors.length > 0) {
        const authorResults = await Promise.all(
            work.authors.slice(0, 3).map(async (authorRef) => {
                try {
                    const author = await requestOpenLibrary(`${authorRef.author.key}.json`);
                    return author.name;
                } catch {
                    return null;
                }
            })
        );

        authors = authorResults.filter(Boolean);
    }

    return normalizeWork(work, { ...editionDetails, authors });
};

module.exports = {
    getBookById,
    searchBooks,
};
