import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Ruler, ArrowLeft } from 'lucide-react';

function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/projects/${id}`)
      .then((res) => {
        setProject(res.data);
        setActiveImage(0);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Project not found.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6 pb-20">
      <div className="max-w-5xl mx-auto">
        <Link to="/projects" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8">
          <ArrowLeft size={18} /> Back to Projects
        </Link>

        <div className="rounded-2xl overflow-hidden mb-2 h-[300px] md:h-[500px]">
          <img
            src={project.images[activeImage].url}
            alt={project.images[activeImage].caption || project.title}
            className="w-full h-full object-cover transition duration-300"
          />
        </div>

        {project.images[activeImage].caption && (
          <p className="text-gray-500 text-sm mb-6">{project.images[activeImage].caption}</p>
        )}

        {project.images.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-10">
            {project.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-20 md:h-24 rounded-lg overflow-hidden border-2 transition ${
                  activeImage === i ? 'border-blue-400' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <span className="text-sm uppercase tracking-wider text-blue-400 font-medium">
          {project.category}
        </span>
        <h1 className="text-4xl font-bold mt-2 mb-4">{project.title}</h1>

        <div className="flex items-center gap-6 text-gray-400 text-sm mb-8">
          <span className="flex items-center gap-2">
            <MapPin size={16} /> {project.location}
          </span>
          <span className="flex items-center gap-2">
            <Ruler size={16} /> {project.area}
          </span>
        </div>

        <p className="text-gray-300 text-lg leading-relaxed">
          {project.description}
        </p>
      </div>
    </div>
  );
}

export default ProjectDetail;