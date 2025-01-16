import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; // Use HashRouter instead of BrowserRouter
import App from './pages/Main'; // Your main page
import Courses from './pages/Courses'; // Import the pages
import Resources from './pages/Resources';
import CivicsLearningPage from './pages/Civicslearning';
import CivicsExamPage from './pages/CivicsExam';
import ChatInterfacePage from './pages/Chatpage';
import ChatFormPage from './pages/Calfreshform';
import DIDInterfacePage from './pages/Didpage';
import FoodBankPage from './pages/Foodbank';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} /> {/* Main page */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/courses/civics-101" element={<CivicsLearningPage />} />
        <Route path="/tests/us-civics" element={<CivicsExamPage />} />
        <Route path="/resources/211-call-center" element={<ChatInterfacePage />} />
        <Route path="/resources/Calfresh" element={<ChatFormPage />} />
        <Route path="/resources/DID" element={<DIDInterfacePage />} />
        <Route path="/resources/foodbank" element={<FoodBankPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
