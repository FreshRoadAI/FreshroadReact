import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Ensure correct path
import freshroadlogo from '../images/freshroadlogo.png';
import { Book, Flag, Globe, PenTool, BookOpen } from 'lucide-react';

const TestSelectionPage = () => {
  const tests = [
    {
      icon: <Flag className="w-8 h-8 text-cyan-400" />, 
      title: 'US Civics Exam',
      description: 'Prepare for the US Citizenship Civics Test.',
      link: '/tests/us-civics'
    },
    {
      icon: <Globe className="w-8 h-8 text-cyan-400" />, 
      title: 'English Proficiency Test',
      description: 'Assess and improve your English skills.',
      link: '/tests/english-proficiency'
    },
    {
      icon: <Book className="w-8 h-8 text-cyan-400" />, 
      title: 'Academic Readiness Test',
      description: 'Evaluate your academic skills for school readiness.',
      link: '/tests/academic-readiness'
    },
    {
      icon: <PenTool className="w-8 h-8 text-cyan-400" />, 
      title: 'Custom Assessment',
      description: 'Take personalized tests tailored to your needs.',
      link: '/tests/custom-assessment'
    }
  ];

  const courses = [
    {
      icon: <BookOpen className="w-8 h-8 text-cyan-400" />,
      title: 'Civics 101',
      description: 'Understand the basics of US Civics.',
      link: '/courses/civics-101'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-cyan-400" />,
      title: 'Beginner English',
      description: 'Learn the basics of English communication.',
      link: '/courses/beginner-english'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-cyan-400" />,
      title: 'Advanced Grammar',
      description: 'Master complex English grammar rules.',
      link: '/courses/advanced-grammar'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-cyan-400" />,
      title: 'TOEFL Preparation',
      description: 'Prepare for the TOEFL exam with expert guidance.',
      link: '/courses/toefl-preparation'
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
          Explore Courses
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">
          Select a course to enhance your knowledge and skills.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <Link 
              to={course.link} 
              key={index} 
              className="flex flex-col items-center p-6 hover:bg-gray-50 rounded-xl cursor-pointer border border-gray-100 transition-all hover:shadow-md"
            >
              {course.icon}
              <h3 className="text-lg font-semibold text-gray-900 mt-4">{course.title}</h3>
              <p className="text-sm text-gray-600 text-center mt-2">{course.description}</p>
            </Link>
          ))}
        </div>
        <h2 className="text-4xl font-bold text-center mt-12 mb-4">
          Select a Test
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">
          Choose a test to start your preparation and improve your skills.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tests.map((test, index) => (
            <Link 
              to={test.link} 
              key={index} 
              className="flex flex-col items-center p-6 hover:bg-gray-50 rounded-xl cursor-pointer border border-gray-100 transition-all hover:shadow-md"
            >
              {test.icon}
              <h3 className="text-lg font-semibold text-gray-900 mt-4">{test.title}</h3>
              <p className="text-sm text-gray-600 text-center mt-2">{test.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TestSelectionPage;
