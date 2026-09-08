import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-wide">
          ArchStudio
        </Link>
        <div className="flex gap-8 text-sm uppercase tracking-wider">
          <Link to="/" className="hover:text-gray-300 transition">Home</Link>
          <Link to="/projects" className="hover:text-gray-300 transition">Projects</Link>
          <Link to="/contact" className="hover:text-gray-300 transition">Contact</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;