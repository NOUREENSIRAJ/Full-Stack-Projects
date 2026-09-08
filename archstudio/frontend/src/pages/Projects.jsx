import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Ruler } from 'lucide-react';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/projects')
      .then((res) => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6 pb-20">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Our Projects</h1>
      <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
        Explore our latest architecture and design work, crafted with precision and imagination.
      </p>

      {loading && (
        <p className="text-center text-gray-500">Loading projects...</p>
      )}

      {!loading && projects.length === 0 && (
        <p className="text-center text-gray-500">No projects found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {projects.map((project) => {
          const hasImage = project.images && project.images.length > 0 && project.images[0].url;
          return (
            <Link
              to={`/projects/${project._id}`}
              key={project._id}
              className="bg-gray-900 rounded-2xl overflow-hidden hover:-translate-y-2 transition duration-300 border border-white/10 block"
            >
              <div className="h-56 overflow-hidden bg-gray-800 flex items-center justify-center">
                {hasImage ? (
                  <img
                    src={project.images[0].url}
                    alt={project.title}
                    className="w-full h-full object-cover hover:scale-110 transition duration-500"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">No Image</span>
                )}
              </div>
              <div className="p-6">
                <span className="text-xs uppercase tracking-wider text-blue-400 font-medium">
                  {project.category}
                </span>
                <h3 className="text-xl font-semibold mt-2 mb-3">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center gap-4 text-gray-500 text-xs">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {project.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Ruler size={14} /> {project.area}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Projects;