import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { API_URL } from '../../config';

function AdminProjectForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'residential',
    area: '',
  });
  const [images, setImages] = useState([{ url: '', caption: '' }]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (isEdit) {
      axios.get(`${API_URL}/api/projects/${id}`)
        .then((res) => {
          const p = res.data;
          setFormData({
            title: p.title || '',
            description: p.description || '',
            location: p.location || '',
            category: p.category || 'residential',
            area: p.area || '',
          });
          setImages(p.images && p.images.length > 0 ? p.images : [{ url: '', caption: '' }]);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load project.');
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (index, field, value) => {
    const updated = [...images];
    updated[index][field] = value;
    setImages(updated);
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    setUploadingIndex(index);
    setError('');

    const token = localStorage.getItem('adminToken');
    const formPayload = new FormData();
    formPayload.append('image', file);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      handleImageChange(index, 'url', `${API_URL}${res.data.url}`);
    } catch (err) {
      setError('Image upload failed. Please try again.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const addImageField = () => {
    setImages([...images, { url: '', caption: '' }]);
  };

  const removeImageField = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const token = localStorage.getItem('adminToken');
    const payload = {
      ...formData,
      images: images.filter((img) => img.url.trim() !== ''),
    };

    try {
      if (isEdit) {
        await axios.put(`${API_URL}/api/projects/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/projects`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Failed to save project. Please check all fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 md:px-16 pt-32 pb-20">
      <div className="max-w-3xl mx-auto">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8">{isEdit ? 'Edit Project' : 'Add New Project'}</h1>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Karachi, Pakistan"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Area</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="4,500 sq ft"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition"
            >
              <option value="residential" className="bg-[#0a0a0f]">Residential</option>
              <option value="commercial" className="bg-[#0a0a0f]">Commercial</option>
              <option value="interior" className="bg-[#0a0a0f]">Interior</option>
              <option value="landscape" className="bg-[#0a0a0f]">Landscape</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-400">Images</label>
              <button
                type="button"
                onClick={addImageField}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus size={14} /> Add Image
              </button>
            </div>

            {images.map((img, index) => (
              <div key={index} className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  {img.url ? (
                    <img src={img.url} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-gray-500 text-xs">
                      No Image
                    </div>
                  )}

                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition rounded-xl px-4 py-3 text-sm">
                      <Upload size={16} />
                      {uploadingIndex === index ? 'Uploading...' : 'Choose Image from Computer'}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(index, e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Caption (optional, e.g. Living Room)"
                  value={img.caption}
                  onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition disabled:opacity-60"
          >
            {saving ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminProjectForm;