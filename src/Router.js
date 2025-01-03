import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './pages/Main'; // Your main page
import Courses from './pages/Courses'; // Import the pages
import Resources from './pages/Resources';


const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App  />} /> {/* Main page */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
