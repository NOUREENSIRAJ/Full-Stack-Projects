const mongoose = require('mongoose');
const Project = require('./models/Project');
require('dotenv').config();

const sampleProjects = [
  {
    title: 'The Azure Residence',
    description: 'A modern glass-walled home blending indoor and outdoor living, designed around natural light and open spaces.',
    location: 'Karachi, Pakistan',
    category: 'residential',
    area: '4,500 sq ft',
    images: [
      { url: '/images/project_images/azure/azure-1.png', caption: 'Kitchen' },
      { url: '/images/project_images/azure/azure-2.png', caption: 'Staircase' },
      { url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200', caption: 'Washroom' },
      { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200', caption: 'Bedroom' },
    ],
  },
  {
    title: 'Meridian Office Tower',
    description: 'A striking commercial tower featuring a curved glass facade, sustainable energy systems, and premium amenities including open-plan workspaces and collaborative meeting areas.',
    location: 'Lahore, Pakistan',
    category: 'commercial',
    area: '120,000 sq ft',
    images: [
      { url: '/images/project_images/office/office-2.png', caption: 'Open Workspace' },
      { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200', caption: 'Reception' },
      { url: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1200', caption: 'Meeting Room' },
    ],
  },
  {
    title: 'Serene Interior Loft',
    description: 'A minimalist interior renovation focused on warm wood tones and functional open-plan living.',
    location: 'Islamabad, Pakistan',
    category: 'interior',
    area: '2,200 sq ft',
    images: [
      { url: '/images/project_images/serena/serena-1.png', caption: 'Bedroom' },
      { url: '/images/project_images/serena/serena-3.png', caption: 'Kitchen' },
      { url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200', caption: 'Living Room' },
    ],
  },
    {
    title: 'Horizon Rooftop Garden',
    description: 'A landscape design project transforming an unused rooftop into a lush, multi-level green retreat with cozy seating areas.',
    location: 'Karachi, Pakistan',
    category: 'landscape',
    area: '3,000 sq ft',
    images: [
      { url: '/images/project_images/garden/garden-2.png', caption: 'Dining Pergola' },
      { url: 'https://images.unsplash.com/photo-1758801304961-f73ee7126207?w=1200', caption: 'Green Terrace' },
      { url: 'https://images.unsplash.com/photo-1463149364514-6c3e89b00382?w=1200', caption: 'Lounge Deck' },
    ],
  },
  {
    title: 'Skyline Residences',
    description: 'A full residential complex offering modern flats with shared amenities including a rooftop terrace, dedicated gym, basement parking, and an on-site mosque for residents.',
    location: 'Lahore, Pakistan',
    category: 'residential',
    area: '250,000 sq ft',
    images: [
      { url: '/images/project_images/skyline_images/skyline-1.png', caption: 'Building Entrance' },
      { url: 'https://images.unsplash.com/photo-1758448500688-3ababa93fd67?w=1200', caption: 'Lobby' },
      { url: '/images/project_images/skyline_images/skyline-3.png', caption: 'Gym' },
      { url: '/images/project_images/skyline_images/skyline-4.png', caption: 'Elevator Lobby' },
      { url: '/images/project_images/skyline_images/skyline-5.png', caption: 'Mosque' },
    ],
  },
];

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully.');

    await Project.deleteMany({});
    console.log('Old projects cleared.');

    await Project.insertMany(sampleProjects);
    console.log('Sample projects added successfully!');

    process.exit(0);
  } catch (err) {
    console.log('ERROR OCCURRED:');
    console.log(err);
    process.exit(1);
  }
}

run();