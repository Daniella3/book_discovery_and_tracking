import { useEffect, useState } from 'react';

const SearchBar = ({ onSearch, initialQuery = '' }) => {
    const [query, setQuery] = useState('');

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        onSearch(query);
    };
    
    return (
        <form onSubmit={handleSubmit} className="mb-5 flex w-full justify-center">
        <div className="flex w-full max-w-2xl items-center gap-3">
        <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books..."
            className="w-full rounded-full border border-[#CBB89D] bg-[#FFF8DF] px-5 py-3 text-[#562F00] outline-none placeholder:text-[#8B7A65]"
        />
        <button
          type="submit"
          className="rounded-full bg-[#E5BEB5] px-5 py-3 font-semibold text-[#562F00] transition hover:opacity-85"
        >
          Search
        </button>
        </div>
        </form>
    );
}; 

export default SearchBar;
