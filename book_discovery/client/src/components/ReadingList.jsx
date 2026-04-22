import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { deleteBookFromReadingList, getReadingList, updateReadingListBook } from '../services/api';

const STATUS_OPTIONS = [
    { value: 'want_to_read', label: 'Want to Read' },
    { value: 'reading', label: 'Reading' },
    { value: 'finished', label: 'Finished' },
];

const statusStyles = {
    want_to_read: 'bg-rose-100 text-rose-800',
    reading: 'bg-sky-100 text-sky-700',
    finished: 'bg-emerald-100 text-emerald-700',
};

const getCatalogBookId = (book) => book.google_book_id || book.openLibraryKey || book.id;

const getBookDetailsState = (book) => ({
    id: getCatalogBookId(book),
    title: book.title,
    authors: book.author ? [book.author] : ['Unknown Author'],
    thumbnail: book.thumbnail,
    description: 'No description available.',
    categories: ['Uncategorized'],
    publishedDate: 'Unknown',
});

const ReadingList = ({ userId, refresh, onBooksChange, showHeading = true }) => {
    const [books, setBooks] = useState([]);
    const [savingBookId, setSavingBookId] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            const data = await getReadingList(userId);
            setBooks(data);
            onBooksChange?.(data);
        };
        if (userId) {
            fetchBooks();
        }
    }, [userId, refresh, onBooksChange]);

    const handleDelete = async (id) => {
        try {
            await deleteBookFromReadingList(id);
            setBooks((currentBooks) => {
                const nextBooks = currentBooks.filter((book) => book.id !== id);
                onBooksChange?.(nextBooks);
                return nextBooks;
            });
        } catch (error) {
            console.error("Error deleting book from reading list:", error);
        }
    };

    const handleUpdate = async (id, updates) => {
        setSavingBookId(id);
        try {
            await updateReadingListBook(id, updates);
            setBooks((currentBooks) => {
                const nextBooks = currentBooks.map((book) => (
                    book.id === id ? { ...book, ...updates } : book
                ));
                onBooksChange?.(nextBooks);
                return nextBooks;
            });
        } catch (error) {
            console.error("Error updating book:", error);
        } finally {
            setSavingBookId(null);
        }
    };

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div>
            {showHeading && (
                <h2 className="text-2xl font-semibold mb-4 text-[#562F00]">
                    Your Reading List
                </h2>
            )}

            {books.length === 0 ? (
                <p className="text-[#562F00]">No books yet</p>
            ) : (
                <div className="space-y-4">
                    {books.map((book) => (
                        <div
                        key={book.id}
                        className="bg-[#FFF0BD] p-4 rounded-lg space-y-4"
                        >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-medium text-[#3E2C23] hover:underline cursor-pointer" 
                                onClick={() => navigate(`/book/${encodeURIComponent(getCatalogBookId(book))}`, {
                                    state: {
                                        book: getBookDetailsState(book),
                                        from: `${location.pathname}${location.search}`,
                                    },
                                })}>
                                    {book.title}</h3>
                                <p className="text-sm text-[#562F00]">{book.author}</p>
                            </div>


                            <label className="flex flex-col items-end text-sm text-[#562F00]">
                                <select className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[book.status] || 'bg-gray-200 text-gray-700'}`} value={book.status || 'want_to_read'} onChange={(event) => handleUpdate(book.id, { status: event.target.value})}>
                                    {STATUS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="grid gap-3 md:grid-cols-[1fr_50px_auto] md:items-center">
                            <label className="flex flex-col gap-2 text-sm text-[#562F00]">
                                Progress
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={book.progress ?? 0}
                                    onChange={(event) => handleUpdate(book.id, { progress: Number(event.target.value) })}
                                />
                                <span>{book.progress ?? 0}% complete</span>
                            </label>

                            <button
                                onClick={() => handleDelete(book.id)}
                                className="text-red-500 hover:underline"
                            >
                                Remove
                            </button>
                        </div>

                        {savingBookId === book.id && (
                            <p className="text-xs text-black">Saving changes...</p>
                        )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReadingList;
