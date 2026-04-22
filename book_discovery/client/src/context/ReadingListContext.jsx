/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const ReadingListContext = createContext();

export const useReadingList = () => useContext(ReadingListContext);

export const ReadingListProvider = ({ children }) => {
  const [readingList, setReadingList] = useState({
    wantToRead: [],
    inProgress: [],
    finished: []
  });

  const addToReadingList = (book) => {
    setReadingList((prev) => {
      const allBooks = [
        ...prev.wantToRead,
        ...prev.inProgress,
        ...prev.finished,
      ];

      if (allBooks.some((b) => b.id === book.id)) return prev;

      return {
        ...prev,
        wantToRead: [...prev.wantToRead, book],
      };
    });
  };

  const removeFromReadingList = (book, listName) => {
    setReadingList(prev => ({
      ...prev,
      [listName]: prev[listName].filter(item => item.id !== book.id)
    }));
  };

  const moveBook = (book, fromList, toList) => {
    setReadingList(prev => ({
      ...prev,
      [fromList]: prev[fromList].filter(item => item.id !== book.id),
      [toList]: [...prev[toList], book]
    }));
  };

  const handleDrop = (bookId, targetList) => {
    const allBooks = [
      ...readingList.wantToRead,
      ...readingList.inProgress,
      ...readingList.finished,
    ];

    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    const fromList = ['wantToRead', 'inProgress', 'finished'].find(list => readingList[list].some(b => b.id === bookId));

    if (fromList && fromList !== targetList) {
      moveBook(book, fromList, targetList);
    }
  };

  return (
    <ReadingListContext.Provider value={{ readingList, addToReadingList, removeFromReadingList, moveBook, handleDrop, }}>
      {children}
    </ReadingListContext.Provider>
  );
};
