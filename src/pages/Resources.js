import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Ensure correct path
import freshroadlogo from '../images/freshroadlogo.png';
import { Headphones, Mic, Apple } from 'lucide-react';

const ResourcesPage = () => {
  const representatives = [
    {
      icon: <Headphones className="w-8 h-8 text-cyan-400" />,
      title: '211 Call Center',
      description: 'Get assistance with community resources and support.',
      link: '/resources/211-call-center',
    },
    {
      icon: <Mic className="w-8 h-8 text-cyan-400" />,
      title: 'DID Interface',
      description: 'Lip Sync and Animated Avatar.',
      link: '/resources/DID',
    },
  ];

  const forms = [
    {
      icon: <Apple className="w-8 h-8 text-cyan-400" />,
      title: 'Calfresh Application',
      description: 'Get assistance with community resources and support.',
      link: '/resources/Calfresh',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img 
                src={freshroadlogo} 
                alt="Fresh Road Logo" 
                className="w-35 h-8 mr-2" 
              />
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1">
                Home
              </Link>
              <Link to="/resources" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1">
                Resources
              </Link>
              <Link to="/community" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1">
                Community
              </Link>
            </div>

            <div className="flex items-center">
              <button className="text-white px-4 py-2 rounded-md hover:bg-blue-700 bg-cyan-400">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-center mb-4">
          Resources
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">
          Connect with representatives for guidance and support.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {representatives.map((rep, index) => (
            <Link 
              to={rep.link} 
              key={index} 
              className="flex flex-col items-center p-6 hover:bg-gray-50 rounded-xl cursor-pointer border border-gray-100 transition-all hover:shadow-md"
            >
              {rep.icon}
              <h3 className="text-lg font-semibold text-gray-900 mt-4">{rep.title}</h3>
              <p className="text-sm text-gray-600 text-center mt-2">{rep.description}</p>
            </Link>
          ))}
        </div>
      </main>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-center mb-4">
          Forms
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">
          Get assistance in filling out forms and applications.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {forms.map((form, index) => (
            <Link 
              to={form.link} 
              key={index} 
              className="flex flex-col items-center p-6 hover:bg-gray-50 rounded-xl cursor-pointer border border-gray-100 transition-all hover:shadow-md"
            >
              {form.icon}
              <h3 className="text-lg font-semibold text-gray-900 mt-4">{form.title}</h3>
              <p className="text-sm text-gray-600 text-center mt-2">{form.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ResourcesPage;
