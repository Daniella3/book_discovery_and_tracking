const HARDCOVER_API_URL = process.env.HARDCOVER_API_URL || 'https://api.hardcover.app/v1/graphql';
const HARDCOVER_API_TOKEN = process.env.HARDCOVER_API_TOKEN;

const fetchJson = (...args) => {
    if (typeof global.fetch === 'function') {
        return global.fetch(...args);
    }

    return import('node-fetch').then(({ default: fetch }) => fetch(...args));
};

const HARDCOVER_USER_AGENT = 'book-discovery/1.0 (local development)';

const ensureToken = () => {
    if (!HARDCOVER_API_TOKEN) {
        const error = new Error('HARDCOVER_API_TOKEN is not configured');
        error.statusCode = 503;
        throw error;
    }
};

const requestHardcover = async (query, variables = {}) => {
    ensureToken();

    const response = await fetchJson(HARDCOVER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: HARDCOVER_API_TOKEN,
            'User-Agent': HARDCOVER_USER_AGENT,
        },
        body: JSON.stringify({ query, variables }),
    });

    const payload = await response.json();

    if (!response.ok || payload.errors) {
        const message = payload.errors?.[0]?.message || `Hardcover request failed with status ${response.status}`;
        const error = new Error(message);
        error.statusCode = response.status || 500;
        throw error;
    }

    return payload.data;
};

const getImageUrl = (image) => {
    if (!image) {
        return 'https://via.placeholder.com/128x195?text=No+Image';
    }

    if (typeof image === 'string') {
        return image;
    }

    return image.url || image.cover_url || image.medium_url || image.small_url || image.large_url || 'https://via.placeholder.com/128x195?text=No+Image';
};

const extractAuthors = (item) => {
    if (Array.isArray(item.author_names) && item.author_names.length > 0) {
        return item.author_names;
    }

    if (Array.isArray(item.contributions)) {
        const names = item.contributions
            .map((contribution) => contribution?.author?.name || contribution?.name)
            .filter(Boolean);

        if (names.length > 0) {
            return names;
        }
    }

    return ['Unknown Author'];
};

const normalizeHardcoverBook = (item) => ({
    id: String(item.id),
    title: item.title || 'No title available.',
    authors: extractAuthors(item),
    description: item.description || 'No description available.',
    thumbnail: getImageUrl(item.image),
    categories: item.genres || item.tags || ['Uncategorized'],
    publishedDate: item.release_date || item.release_year || 'Unknown',
    rating: item.rating ?? null,
    ratingsCount: item.ratings_count ?? 0,
    reviewsCount: item.reviews_count ?? 0,
    moods: item.moods || [],
    pages: item.pages ?? null,
    usersCount: item.users_count ?? 0,
    usersReadCount: item.users_read_count ?? 0,
    seriesNames: item.series_names || [],
});

const uniqueBooks = (books) => {
    const seen = new Set();

    return books.filter((book) => {
        if (!book?.id || seen.has(book.id)) {
            return false;
        }

        seen.add(book.id);
        return true;
    });
};

const scoreBookAgainstQuery = (book, queryTerms) => {
    const title = (book.title || '').toLowerCase();
    const description = (book.description || '').toLowerCase();
    const authors = (book.authors || []).join(' ').toLowerCase();
    const categories = (book.categories || []).join(' ').toLowerCase();
    const moods = (book.moods || []).join(' ').toLowerCase();
    const seriesNames = (book.seriesNames || []).join(' ').toLowerCase();

    return queryTerms.reduce((score, term) => {
        let nextScore = score;

        if (categories.includes(term)) nextScore += 10;
        if (moods.includes(term)) nextScore += 10;
        if (description.includes(term)) nextScore += 4;
        if (seriesNames.includes(term)) nextScore += 3;
        if (authors.includes(term)) nextScore += 2;
        if (title.includes(term)) nextScore += 2;
        if (title === term) nextScore -= 1;

        return nextScore;
    }, 0);
};

const runSearchQuery = async ({ query, page, perPage, fields, weights }) => {
    const searchArgs = [
        'query: $query',
        'query_type: "Book"',
        'page: $page',
        'per_page: $perPage',
    ];

    if (fields) {
        searchArgs.push('fields: $fields');
    }

    if (weights) {
        searchArgs.push('weights: $weights');
    }

    const data = await requestHardcover(
        `
        query SearchBooks($query: String!, $page: Int!, $perPage: Int!, $fields: String, $weights: String) {
          search(
            ${searchArgs.join(',\n            ')}
          ) {
            results
          }
        }
        `,
        {
            query,
            page,
            perPage,
            fields,
            weights,
        }
    );

    return coerceSearchResults(data.search?.results).map(normalizeHardcoverBook);
};

const coerceSearchResults = (results) => {
    if (!results) {
        return [];
    }

    if (Array.isArray(results)) {
        return results;
    }

    if (typeof results === 'string') {
        try {
            return coerceSearchResults(JSON.parse(results));
        } catch {
            return [];
        }
    }

    if (Array.isArray(results.results)) {
        return results.results;
    }

    if (Array.isArray(results.hits)) {
        return results.hits.map((hit) => hit.document || hit);
    }

    return [];
};

const searchBooks = async ({ query, page = 1, perPage = 30 }) => {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    const primaryResults = await runSearchQuery({
        query,
        page,
        perPage,
    });

    const discoveryResults = primaryResults.length > 0
        ? []
        : await runSearchQuery({
            query,
            page,
            perPage,
            fields: 'genres,tags,moods,description,title,author_names,alternative_titles,series_names',
            weights: '8,8,6,4,2,2,2,2',
        });

    return uniqueBooks([...primaryResults, ...discoveryResults])
        .sort((a, b) => scoreBookAgainstQuery(b, queryTerms) - scoreBookAgainstQuery(a, queryTerms))
        .slice(0, perPage);
};

const getBookById = async (id) => {
    const numericId = Number(id);

    if (Number.isNaN(numericId)) {
        return null;
    }

    const data = await requestHardcover(
        `
        query GetBookById($id: Int!) {
          books(where: { id: { _eq: $id } }, limit: 1) {
            id
            title
            subtitle
            description
            release_date
            release_year
            pages
            rating
            ratings_count
            reviews_count
            users_count
            users_read_count
            moods
            genres
            tags
            series_names
            image
            author_names
            contributions {
              author {
                name
              }
            }
          }
        }
        `,
        {
            id: numericId,
        }
    );

    const book = data.books?.[0];
    return book ? normalizeHardcoverBook(book) : null;
};

const findBookByMetadata = async ({ title, author }) => {
    const query = [title, author].filter(Boolean).join(' ').trim();

    if (!query) {
        return null;
    }

    const results = await searchBooks({ query, perPage: 5 });
    const normalizedAuthor = String(author || '').toLowerCase();
    const normalizedTitle = String(title || '').toLowerCase();

    return results.find((book) => {
        const bookAuthors = (book.authors || []).join(' ').toLowerCase();
        return book.title.toLowerCase().includes(normalizedTitle) || bookAuthors.includes(normalizedAuthor);
    }) || results[0] || null;
};

module.exports = {
    findBookByMetadata,
    getBookById,
    searchBooks,
};
