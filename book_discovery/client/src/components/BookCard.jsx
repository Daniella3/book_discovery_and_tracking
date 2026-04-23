import { useState } from "react";
import { addBookToReadingList } from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import placeholderImage from "../assets/image-placeholder.svg";

const BookCard = ({ book, onAdd, userId }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [wasAdded, setWasAdded] = useState(false);

    const handleAdd = async () => {
        setIsAdding(true);
        try {
            const res = await addBookToReadingList(book);
            if (onAdd) {
                onAdd();
            }
            console.log("Added", res);
            setWasAdded(true);
        } catch (error) {
            console.error("Error adding book to reading list:", error);
        } finally {
            setIsAdding(false);
        }
    };

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="group bg-[#896C6C] rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden">
            <div
              onClick={() => navigate(`/book/${encodeURIComponent(book.id)}`, {
                state: {
                  book,
                  from: `${location.pathname}${location.search}`,
                },
              })}
              className="cursor-pointer"
            >
                <img
                    src={book.thumbnail || placeholderImage }
                    alt={book.title}
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = placeholderImage;
                    }}
                    className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                />
            </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg line-clamp-2 text-[#F5DAA7]">
              {book.title}
            </h3>
    
            <p className="text-sm text-[#C5D8A4] mb-3">
              {book.authors.join(", ")}
            </p>
    
            {userId && (
              <button
                onClick={handleAdd}
                disabled={isAdding || wasAdded}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-[#E4DFB5] to-[#FDAB9E] text-white font-medium hover:opacity-90 transition"
              >
                {wasAdded ? "Added!" : isAdding ? "Adding..." : "Add to List"}
              </button>
            )}
          </div>
        </div>
    );
};

export default BookCard;
