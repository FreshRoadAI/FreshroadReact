import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './pages/Main'; // Your main page
import Courses from './pages/Courses'; // Import the pages
import Resources from './pages/Resources';
import CivicsLearningPage from './pages/Civicslearning';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App  />} /> {/* Main page */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/courses/civics-101" element={<CivicsLearningPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
