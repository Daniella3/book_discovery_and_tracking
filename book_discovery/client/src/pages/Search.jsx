import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BookCard from "../components/BookCard";
import NavBar from "../components/NavBar";
import SearchBar from "../components/SearchBar";
import { logActivity, searchBooks } from "../services/api";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const timeoutRef = useRef(null);
  const queryFromUrl = searchParams.get("q") || "";

  useEffect(() => {
    if (!queryFromUrl.trim()) {
      return;
    }

    const runSearch = async () => {
      setLoading(true);
      const results = await searchBooks({ query: queryFromUrl });
      setBooks(results);
      setLoading(false);

      if (userId) {
        try {
          await logActivity({
            userId,
            activityType: "search",
            activityData: { query: queryFromUrl },
          });
        } catch (error) {
          console.error("Error logging search activity:", error);
        }
      }
    };

    runSearch();
  }, [queryFromUrl, userId]);

  const handleSearch = (query) => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setSearchParams(query.trim() ? { q: query } : {});
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#EEE6CA]">
      <NavBar userId={userId} setUserId={setUserId} />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-rose-400">Search Library</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight text-[#562F00]">
            Find Your Next Great Read 
          </h1>
        </div>

        <div className="mx-auto mt-10 max-w-full">
          <SearchBar onSearch={handleSearch} initialQuery={queryFromUrl} />
        </div>

        <div className="mt-12">
          {loading && (
            <p className="text-center text-gray-500">Searching books...</p>
          )}

          {!loading && queryFromUrl && books.length > 0 && (
            <>
              <h2 className="mb-6 text-2xl font-semibold text-[#313E17]">Results for "{queryFromUrl}"</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} userId={userId} />
                ))}
              </div>
            </>
          )}

          {!loading && queryFromUrl && books.length === 0 && (
            <p className="text-center text-gray-500">
              No books matched that search yet. Try a different title, author, or keyword.
            </p>
          )}

          {!loading && !queryFromUrl && (
            <p className="text-center text-[#4C5C2D]">
              Start by searching for a title, author, or topic.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
