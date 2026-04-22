import { Link, useNavigate } from "react-router-dom";

const NavBar = ({ userId, setUserId }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-[#896C6C] backdrop-blur-md sticky top-0 z-50 border-b border-[#9AB17A] text-[#F5FAE1]">
  
        <h1 className="text-xl font-bold tracking-tight">
            StoryTeller
        </h1>

        <div className="flex items-center gap-6 text-sm font-medium">
            {userId && (
            <>
              <Link to="/dashboard" className="hover:text-rose-300 transition">
                  Dashboard
              </Link>
            </>
            )}
            
            <Link to="/search" className="hover:text-rose-300 transition">
            Search
            </Link>

            

            {!userId ? (
            <>
              <Link to="/login" className="hover:text-rose-300 transition">
                  Login
              </Link>
              <Link to="/register" className="bg-[#FFC6C6] text-[#694E4E] px-4 py-1.5 rounded-lg">
                  Register
              </Link>
            </>
            ) : (
            <button
                onClick={() => {
                localStorage.clear();
                setUserId(null);
                navigate("/search");
                }}
                className="text-red-500"
            >
                Logout
            </button>
            )}
        </div>
        </nav>
  );
};

export default NavBar;
