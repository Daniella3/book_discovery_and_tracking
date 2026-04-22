import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import ReadingList from "../components/ReadingList";

const chooseNextRead = (queuedBooks, iteration) => {
  if (queuedBooks.length === 0) {
    return null;
  }

  const sortedByAge = [...queuedBooks].sort(
    (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
  );

  if (queuedBooks.length === 1) {
    return {
      book: queuedBooks[0],
      reason: "This is the only unread book in your queue, so it is the clearest next step.",
      label: "Clear Next Pick",
    };
  }

  const selectionMode = iteration % 3;

  if (selectionMode === 0) {
    const oldestBook = sortedByAge[0];
    return {
      book: oldestBook,
      reason: "'Love me, choose me, read me!' This book has been in your queue the longest, so it's a great time to give it some attention.",
      label: "Longest Waiting",
    };
  }

  if (selectionMode === 1) {
    const newestBook = sortedByAge[sortedByAge.length - 1];
    return {
      book: newestBook,
      reason: "This book is the freshest addition to your queue, so it might be a great time to dive in while the excitement is still new.",
      label: "Fresh Interest",
    };
  }

  const randomIndex = Math.floor(Math.random() * sortedByAge.length);
  console.log(randomIndex);
  const randomBook = sortedByAge[randomIndex];
  return {
    book: randomBook,
    reason: "This is a random pick if you needed help just making a decision of which book to start first.",
    label: "Random Pick",
  };
};

const Dashboard = () => {
  const [readingListBooks, setReadingListBooks] = useState([]);
  const [userId, setUserId] = useState(
    localStorage.getItem("userId")
  );
  const [pickIteration, setPickIteration] = useState(0);

  const stats = useMemo(() => {
    const total = readingListBooks.length;
    const currentlyReading = readingListBooks.filter((book) => book.status === "reading");
    const finished = readingListBooks.filter((book) => book.status === "finished");
    const queued = readingListBooks.filter((book) => book.status === "want_to_read");
    const averageProgress = currentlyReading.length === 0
      ? 0
      : Math.round(currentlyReading.reduce((sum, book) => sum + (book.progress || 0), 0) / currentlyReading.length);
    const recentAdd = (
      [...readingListBooks]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0]
    ) || null;

    return {
      total,
      currentlyReading,
      finished,
      queued,
      averageProgress,
      recentAdd,
    };
  }, [readingListBooks]);

  const nextReadPick = useMemo(
    () => chooseNextRead(stats.queued, pickIteration),
    [stats.queued, pickIteration]
  );

  return (
    <div className="min-h-screen bg-[#EEE6CA]">
      
      <NavBar userId={userId} setUserId={setUserId} />

      {/* HERO */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-20">
        <p className="text-sm uppercase tracking-[0.35em] text-rose-400">Reader Dashboard</p>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-[#562F00]">
          Build a reading rhythm that actually sticks
        </h1>
        <p className="text-[#4C5C2D] max-w-xl mb-8 text-lg">
          Track progress, manage your queue, and keep your reading life organized in one calm workspace.
        </p>
        <Link
          to="/search"
          className="rounded-full bg-[#FFF0BD] px-6 py-3 text-sm font-semibold text-[#562F00] transition hover:opacity-85"
        >
          Search for Books
        </Link>
      </div>

      {/* CONTENT LAYOUT */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-6 px-4">
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="space-y-6">
              <div className="bg-[#E5BEB5] p-6 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-semibold mb-4 text-[#562F00]">
                  Reading Dashboard
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-rose-50 p-4">
                    <p className="text-sm text-rose-600">Books Tracked</p>
                    <p className="mt-2 text-3xl font-bold text-rose-950">{stats.total}</p>
                  </div>
                  <div className="rounded-2xl bg-sky-50 p-4">
                    <p className="text-sm text-sky-700">Currently Reading</p>
                    <p className="mt-2 text-3xl font-bold text-sky-950">{stats.currentlyReading.length}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-sm text-emerald-700">Finished</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-950">{stats.finished.length}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="text-sm text-amber-700">Average Progress</p>
                    <p className="mt-2 text-3xl font-bold text-amber-950">{stats.averageProgress}%</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-[#E5BEB5] p-6 rounded-2xl shadow-sm">
                  <h2 className="text-2xl font-semibold mb-4 text-[#562F00]">
                    In Progress
                  </h2>

                  {stats.currentlyReading.length === 0 ? (
                    <p className="text-[#4C5C2D]">
                      Move a book into Reading to track momentum here.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {stats.currentlyReading.map((book) => (
                        <div key={`progress-${book.id}`} className="rounded-xl bg-[#FFF0BD] p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-[#3E2C23]">{book.title}</h3>
                              <p className="text-sm text-[#562F00]">{book.author}</p>
                            </div>
                            <span className="text-sm font-semibold">{book.progress || 0}%</span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-zinc-700">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
                              style={{ width: `${book.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-[#E5BEB5] p-6 rounded-2xl shadow-sm">
                  <h2 className="text-2xl text-[#562F00] font-semibold mb-4">
                    Reading Pulse
                  </h2>

                  <div className="space-y-4">
                    <div className="rounded-xl bg-[#FFF0BD] p-4">
                      <p className="text-sm text-[#4C5C2D]">Next Up</p>
                      <p className="mt-1 text-lg font-semibold">{stats.queued.length}</p>
                      <p className="text-sm text-[#562F00]">Books waiting in your queue.</p>
                    </div>

                    <div className="rounded-xl bg-[#FFF0BD] p-4">
                      <p className="text-sm text-[#4C5C2D]">Recent Adds</p>
                      {!stats.recentAdd ? (
                        <p className="mt-2 text-sm text-[#4C5C2D]">Add a few books to start shaping your reading flow.</p>
                      ) : (
                        <div className="mt-3 rounded-2xl bg-[#E5BEB5] p-4">
                          <p className="font-medium text-[#3E2C23]">{stats.recentAdd.title}</p>
                          <p className="mt-1 text-sm text-[#562F00]">{stats.recentAdd.author}</p>
                          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#4C5C2D]">
                            {stats.recentAdd.status?.replaceAll("_", " ") || "want to read"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#E5BEB5] p-6 rounded-2xl shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#562F00]">
                      Choose My Next Read
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-[#4C5C2D]"> Need help decided what next to read? Look no further! </p>
                  </div>

                  <button
                    onClick={() => setPickIteration((current) => current + 1)}
                    disabled={stats.queued.length <= 1}
                    className="rounded-full bg-[#FFF0BD] px-5 py-2 text-sm font-semibold text-[#562F00] transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Pick Another
                  </button>
                </div>

                {!nextReadPick ? (
                  <div className="mt-6 rounded-2xl bg-[#FFF0BD] p-5">
                    <p className="font-medium text-[#3E2C23]">Your queue is empty.</p>
                    <p className="mt-2 text-sm text-[#562F00]">
                      Add a few books to Want to Read and this feature will start surfacing a focused next pick.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 rounded-3xl bg-[#FFF0BD] p-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#4C5C2D]">
                      {nextReadPick.label}
                    </p>
                    <h3 className="mt-3 text-3xl font-bold text-[#3E2C23]">
                      {nextReadPick.book.title}
                    </h3>
                    <p className="mt-2 text-base text-[#562F00]">
                      {nextReadPick.book.author}
                    </p>
                    <p className="mt-5 max-w-2xl leading-7 text-[#562F00]">
                      {nextReadPick.reason}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <aside className="bg-[#E5BEB5] p-6 rounded-2xl shadow-sm h-fit">
              <ReadingList
                userId={userId}
                onBooksChange={setReadingListBooks}
              />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
