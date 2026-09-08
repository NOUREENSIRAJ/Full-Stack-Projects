import { useState } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      await axios.post('http://localhost:5000/api/contact', formData);
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-hidden pt-32 px-6 md:px-16 pb-20">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-blue-400 text-sm uppercase tracking-widest font-medium">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Let's Build Something Great</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Have a project in mind? Tell us about it, and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Office</h3>
                  <p className="text-gray-400 text-sm">123 Design Avenue, Karachi, Pakistan</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-gray-400 text-sm">hello@archstudio.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-gray-400 text-sm">+92 300 1234567</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-3">
                <a href="#" className="px-4 py-2 rounded-full bg-white/10 text-sm hover:bg-blue-500/20 hover:text-blue-400 transition">
                  Instagram
                </a>
                <a href="#" className="px-4 py-2 rounded-full bg-white/10 text-sm hover:bg-blue-500/20 hover:text-blue-400 transition">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Reen S"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Your Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="reens@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="text-sm text-gray-400 mb-2 block">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Your Message</label>
                <textarea
                  name="message"
                  placeholder="Tell us about your project..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2 shadow-lg shadow-white/10 disabled:opacity-60"
              >
                {loading ? 'Sending...' : (
                  <>
                    Send Message <Send size={18} />
                  </>
                )}
              </button>

              {status === 'success' && (
                <p className="text-center text-green-400 text-sm mt-4">
                  Message sent successfully! We'll be in touch soon.
                </p>
              )}
              {status === 'error' && (
                <p className="text-center text-red-400 text-sm mt-4">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Contact;