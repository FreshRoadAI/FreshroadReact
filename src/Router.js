import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; // Use HashRouter instead of BrowserRouter
import App from './pages/Main'; // Your main page
import Courses from './pages/Courses'; // Import the pages
import Resources from './pages/Resources';
import CivicsLearningPage from './pages/Civicslearning';
import CivicsExamPage from './pages/CivicsExam';
import ChatInterfacePage from './pages/Chatpage';
import PhoneCallPage from './pages/PhoneCallPage';
import DIDInterfacePage from './pages/Didpage';
import NoAvatarPage from './pages/NoAvatarPage';
import PhoneCallNoTextPage from './pages/PhoneCallNoTextPage';

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
        <Route path="/resources/PlainPage" element={<NoAvatarPage />} />
        <Route path="/resources/DID" element={<DIDInterfacePage />} />
        <Route path="/resources/phone" element={<PhoneCallPage />} />
        <Route path="/resources/phonecall" element={<PhoneCallNoTextPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
