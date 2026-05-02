import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { addBookToReadingList, getBookById } from '../services/api';
import placeholderImage from '../assets/image-placeholder.svg';

const getStoredNote = (bookId) => localStorage.getItem(`book-note:${bookId}`) || '';

const BookDetails = () => {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const [book, setBook] = useState(state?.book ?? null);
    const [loading, setLoading] = useState(!state?.book);
    const [note, setNote] = useState(() => (state?.book?.id ? getStoredNote(state.book.id) : ''));
    const [isAdding, setIsAdding] = useState(false);
    const [wasAdded, setWasAdded] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const backTarget = state?.from || "/search";

    useEffect(() => {
        let isMounted = true;

        const fetchBook = async () => {
            const result = await getBookById(id);

            if (isMounted) {
                setBook((currentBook) => result || currentBook);
                if (result?.id) {
                    setNote(getStoredNote(result.id));
                }
                setLoading(false);
            }
        };

        fetchBook();

        return () => {
            isMounted = false;
        };
    }, [id]);

    if (loading) {
        return <div>Loading book details...</div>;
    }

    if (!book) {
        return <div>No book details available.</div>;
    }

    const handleSaveNote = () => {
        localStorage.setItem(`book-note:${book.id}`, note);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    const handleAddBook = async () => {
        setIsAdding(true);
        try {
            await addBookToReadingList(book);
            setWasAdded(true);
        } catch (error) {
            console.error("Error adding book from details page:", error);
        } finally {
            setIsAdding(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#EEE6CA] px-4 py-10">
          <div className="mx-auto grid max-w-5xl gap-8 rounded-3xl bg-[#E5BEB5] p-8 shadow-sm lg:grid-cols-[280px_1fr]">
            <div>
              <button
                onClick={() => navigate(backTarget)}
                className="mb-5 rounded-full border border-[#EEE6CA] px-4 py-2 text-sm font-medium transition hover:bg-[#EEE6CA]"
              >
                Back
              </button>
              <img
                src={book.thumbnail || placeholderImage}
                alt={book.title}
                onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = placeholderImage;
                }}
                className="w-full rounded-2xl object-cover shadow-sm"
              />
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-yellow-950">Book Brief</p>
                <h1 className="mt-2 text-4xl font-bold">{book.title}</h1>
                <p className="mt-3 text-lg text-yellow-950">{book.authors?.join(", ")}</p>
                {userId && (
                  <button
                    onClick={handleAddBook}
                    disabled={isAdding || wasAdded}
                    className="mt-5 rounded-full bg-[#562F00] px-5 py-2 text-sm font-semibold text-[#FFF0BD] transition hover:opacity-85"
                  >
                    {wasAdded ? "Added!" : isAdding ? "Adding..." : "Add to List"}
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#FFF0BD] p-4">
                  <p className="text-sm text-gray-500">Published</p>
                  <p className="mt-2 font-semibold">{book.publishedDate}</p>
                </div>
                <div className="rounded-2xl bg-[#FFF0BD] p-4">
                  <p className="text-sm text-gray-500">Categories</p>
                  <p className="mt-2 font-semibold">{book.categories?.join(", ")}</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">Overview</h2>
                <p className="mt-3 leading-7 text-[#562F00]">{book.description}</p>
              </div>

              {userId ? (
                <div className="rounded-3xl bg-gradient-to-br from-amber-100 via-rose-50 to-sky-100 p-6 text-gray-900">
                  <h2 className="text-2xl font-semibold">Reading Journal</h2>
                  <p className="mt-2 text-sm text-yellow-950">
                    Capture why you chose this book, what you want to learn, or anything worth remembering.
                  </p>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Write your thoughts, favorite ideas, or a quick review..."
                    className="mt-4 min-h-40 w-full rounded-2xl border border-white/60 bg-white/80 p-4 outline-none"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="mt-4 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white"
                  >
                    {saveSuccess ? "Saved!" : "Save Note"}
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl bg-gradient-to-br from-amber-100 via-rose-50 to-sky-100 p-6 ">
                  <h2 className="text-2xl font-semibold">Reader Tools</h2>
                  <p className="mt-2 text-sm text-[#674636]">
                    Sign in to unlock the reading dashboard, personal notes, and your saved reading list.
                  </p>
                  <Link
                    to="/login"
                    className="mt-4 inline-flex rounded-full bg-[#C1CFA1] px-5 py-2 text-sm font-semibold text-black"
                  >
                    Login to Save Progress
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
    );
}

export default BookDetails;
