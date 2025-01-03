import logo from './logo.svg';
import './App.css';
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

const App = () => {
  const [selectedRole, setSelectedRole] = useState('All');
  
  const roles = ['All', 'Student', 'Teacher', 'Parent', 'Institution'];
  const services = [
    { 
      icon: <BookOpen className="w-8 h-8 text-blue-600" />, 
      title: 'Courses'
    },
    { 
      icon: <GraduationCap className="w-8 h-8 text-blue-600" />, 
      title: 'Academic Programs'
    },
    { 
      icon: <Video className="w-8 h-8 text-blue-600" />, 
      title: 'Live Classes'
    },
    { 
      icon: <Brain className="w-8 h-8 text-blue-600" />, 
      title: 'AI Tutoring'
    },
    { 
      icon: <Calendar className="w-8 h-8 text-blue-600" />, 
      title: 'Schedule'
    },
    { 
      icon: <Library className="w-8 h-8 text-blue-600" />, 
      title: 'Resources'
    },
    { 
      icon: <FileText className="w-8 h-8 text-blue-600" />, 
      title: 'Assignments'
    },
    { 
      icon: <BarChart className="w-8 h-8 text-blue-600" />, 
      title: 'Progress'
    },
    { 
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />, 
      title: 'Discussion'
    },
    {
      icon: <Code className="w-8 h-8 text-blue-600" />,
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
              <GraduationCap className="w-8 h-8 text-blue-600 mr-2" />
              <div>
                <h1 className="text-xl font-bold">ChatUni</h1>
                <p className="text-sm text-gray-600">— Learn Smarter —</p>
              </div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="#" className="text-gray-900 inline-flex items-center px-1 pt-1">
                Courses
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1">
                Resources
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1">
                Community
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1">
                Company
              </a>
            </div>
            
            <div className="flex items-center">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Start Learning
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Announcement Bar */}
      <div className="bg-blue-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p>New: AI-Powered Personalized Learning !</p>
          <button className="text-sm bg-white text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50">
            Learn More
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-center mb-4">
          Your Gateway to AI Education
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">
          Personalized learning experiences powered by AI
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
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'
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