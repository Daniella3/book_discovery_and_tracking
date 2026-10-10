import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BookCard from "../components/BookCard";
import NavBar from "../components/NavBar";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { logActivity, searchBooks } from "../services/api";

const BOOKS_PER_PAGE = 12;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const timeoutRef = useRef(null);
  const resultsRef = useRef(null);
  const queryFromUrl = searchParams.get("q") || "";
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    if (!queryFromUrl.trim()) {
      setBooks([]);
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

  const totalPages = Math.max(1, Math.ceil(books.length / BOOKS_PER_PAGE));
  const currentPage = Math.min(Math.max(pageFromUrl, 1), totalPages);

  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
    return books.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  }, [books, currentPage]);

  useEffect(() => {
    if (!queryFromUrl || books.length === 0) {
      return;
    }

    if (pageFromUrl !== currentPage) {
      setSearchParams({ q: queryFromUrl, page: String(currentPage) }, { replace: true });
    }
  }, [books.length, currentPage, pageFromUrl, queryFromUrl, setSearchParams]);

  const handleSearch = (query) => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setSearchParams(query.trim() ? { q: query, page: "1" } : {});
    }, 250);
  };

  const handlePageChange = (page) => {
    setSearchParams({ q: queryFromUrl, page: String(page) });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

        <div className="mt-12" ref={resultsRef}>
          {loading && (
            <p className="text-center text-gray-500">Searching books...</p>
          )}

          {!loading && queryFromUrl && books.length > 0 && (
            <>
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-2xl font-semibold text-[#313E17]">Results for "{queryFromUrl}"</h2>
                <p className="text-sm text-[#4C5C2D]">
                  Showing {(currentPage - 1) * BOOKS_PER_PAGE + 1}-{Math.min(currentPage * BOOKS_PER_PAGE, books.length)} of {books.length}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {paginatedBooks.map((book) => (
                  <BookCard key={book.id} book={book} userId={userId} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
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
