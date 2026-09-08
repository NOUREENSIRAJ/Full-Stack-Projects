import { Building2, Sparkles, Users, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroScene from '../components/HeroScene';
import BackgroundSlideshow from '../components/BackgroundSlideshow';

function Home() {
  return (
    <div className="bg-[#0a0a0f] text-white overflow-hidden">
      <section className="relative min-h-screen flex items-center px-6 md:px-16 pt-24">
        <BackgroundSlideshow />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
              <Sparkles size={14} className="text-blue-400" />
              Award-winning architecture studio
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              We Design Spaces
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
                That Inspire
              </span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              ArchStudio blends architecture, technology, and imagination to create spaces that tell a story from concept to completion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/projects" className="bg-white text-black px-7 py-3 rounded-full font-medium hover:bg-gray-200 transition flex items-center gap-2 shadow-lg shadow-white/10">
                View Our Work <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="border border-white/30 px-7 py-3 rounded-full font-medium hover:bg-white/10 transition backdrop-blur-sm">
                Get In Touch
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[550px]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-400/10 blur-3xl rounded-full"></div>
            <HeroScene />
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 md:px-16 border-t border-white/10 bg-gradient-to-b from-[#0a0a0f] to-[#0d1420]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <span className="text-blue-400 text-sm uppercase tracking-widest font-medium block text-center mb-3">
            What We Offer
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">What We Do</h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
            Full-service architecture and design, tailored to every kind of space.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-blue-400/50 hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition">
                <Building2 className="text-blue-400" size={26} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Residential Design</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Custom homes designed around how you actually live light, flow, and comfort at every turn.
              </p>
            </div>
            <div className="group bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-blue-400/50 hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition">
                <Sparkles className="text-blue-400" size={26} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interior Styling</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Interiors that balance form and function, crafted with materials that age beautifully.
              </p>
            </div>
            <div className="group bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-blue-400/50 hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition">
                <Users className="text-blue-400" size={26} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Commercial Spaces</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Offices, retail, and hospitality spaces built to leave a lasting impression on every visitor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 md:px-16 border-t border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden h-[350px] shadow-2xl shadow-blue-900/20">
            <img src="/images/project_images/skyline_images/skyline-1.png" alt="Featured project" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-blue-400 text-sm uppercase tracking-widest font-medium">
              Featured Project
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">Skyline Residences</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              A full residential complex offering modern flats with shared amenities including a rooftop terrace, dedicated gym, basement parking, and an on-site mosque for residents.
            </p>
            <Link to="/projects" className="inline-flex items-center gap-2 text-white border-b border-white/30 pb-1 hover:border-blue-400 hover:text-blue-400 transition">
              Explore the project <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-6 md:px-16 border-t border-white/10 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">120+</h3>
            <p className="text-gray-400 text-sm mt-2">Projects Completed</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">15+</h3>
            <p className="text-gray-400 text-sm mt-2">Years Experience</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">40+</h3>
            <p className="text-gray-400 text-sm mt-2">Design Awards</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">98%</h3>
            <p className="text-gray-400 text-sm mt-2">Client Satisfaction</p>
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 md:px-16 text-center border-t border-white/10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <Award className="text-blue-400" size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Have a project in mind?</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Let's turn your vision into a space people remember.
          </p>
          <Link to="/contact" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition inline-flex items-center gap-2 shadow-lg shadow-white/10">
            Start a Conversation <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;