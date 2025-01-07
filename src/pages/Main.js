import '../App.css'; // Update this to point to the root directory
import logo from '../logo.svg'; // Same for logo
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Calendar,
  Library,
  FileText,
  BarChart,
  Video,
  MessageCircle,
  Brain,
  Lightbulb,
  Code,
  PenTool,
  Music
} from 'lucide-react';
import freshroadlogo from '../images/freshroadlogo.png';

const App = () => {
  const [selectedRole, setSelectedRole] = useState('All');
  
  const roles = ['All', 'Immigrant', 'Student', 'Institution'];
  const services = [
    { 
      icon: <BookOpen className="w-8 h-8 text-cyan-400" />, 
      title: 'Courses'
    },
    { 
      icon: <GraduationCap className="w-8 h-8 text-cyan-400" />, 
      title: 'Academic Programs'
    },
    { 
      icon: <Video className="w-8 h-8 text-cyan-400" />, 
      title: 'Live Classes'
    },
    { 
      icon: <Brain className="w-8 h-8 text-cyan-400" />, 
      title: 'AI Tutoring'
    },
    { 
      icon: <Calendar className="w-8 h-8 text-cyan-400" />, 
      title: 'Schedule'
    },
    { 
      icon: <Library className="w-8 h-8 text-cyan-400" />, 
      title: 'Resources'
    },
    { 
      icon: <FileText className="w-8 h-8 text-cyan-400" />, 
      title: 'Assignments'
    },
    { 
      icon: <BarChart className="w-8 h-8 text-cyan-400" />, 
      title: 'Progress'
    },
    { 
      icon: <MessageCircle className="w-8 h-8 text-cyan-400" />, 
      title: 'Discussion'
    },
    {
      icon: <Code className="w-8 h-8 text-cyan-400" />,
      title: 'Coding'
    }
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
    alt="ChatUni Logo" 
    className="w-35 h-8 mr-2" 
  />
</div>

      <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
        <Link to="/courses" className="text-gray-900 inline-flex items-center px-1 pt-1">
          Learn
        </Link>
        <Link to="/resources" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1">
          Resources
        </Link>
        <Link to="/community" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1">
          News
        </Link>
        <Link to="/company" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1">
          Company
        </Link>
      </div>

      <div className="flex items-center">
        <button className=" text-white px-4 py-2 rounded-md hover:bg-blue-700 bg-cyan-400">
          Sign In
        </button>
      </div>
    </div>
  </div>
</nav>;

      {/* Announcement Bar */}
      <div className="bg-cyan-500 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p>Take your next step!</p>
          <button className="text-sm bg-white text-cyan-400 px-3 py-1 rounded-full hover:bg-blue-50">
            Learn More
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-center mb-4">
          Fresh Road
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">
        We are the personalized AI language learning companion designed specifically to help non-native speakers navigate essential government and social services.
        </p>

        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-center mb-6">
            Choose A Role to Get Started
          </h3>
          
          <div className="flex justify-center space-x-4">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  selectedRole === role
                    ? 'bg-cyan-400 text-white border-cyan-400'
                    : 'border-cyan-400 text-cyan-400 hover:bg-blue-50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 hover:bg-gray-50 rounded-xl cursor-pointer border border-gray-100 transition-all hover:shadow-md"
            >
              {service.icon}
              <span className="text-sm text-gray-600 mt-2">{service.title}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;