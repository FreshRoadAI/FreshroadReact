    import React, { useState, useEffect, useRef } from 'react';
    import { useNavigate } from 'react-router-dom';
    import '../App.css';
    import freshroadlogo from '../images/freshroadlogo.png';
    import avatarImage from '../images/callrep.png';
    import {
      PaperAirplaneIcon,
      MicrophoneIcon,
      TranslateIcon,
    } from '@heroicons/react/outline';
    import { tts11 } from '../api/elevenlabs';
    
    const ChatFormPage = () => {
      // -------------------------
      // State
      // -------------------------
      const [messages, setMessages] = useState([
        {
          sender: 'bot',
          text: 'I am here to help you fill out the Calfresh application. Please provide me with the necessary information to get started. Please provide me with your contact email address.',
        },
      ]);
      const [input, setInput] = useState('');
      const [isListening, setIsListening] = useState(false);
      const [spokenText, setSpokenText] = useState('');
      const [selectedLanguage, setSelectedLanguage] = useState('English');
      const [isTranslating, setIsTranslating] = useState(false);
    
      // -------------------------
      // Refs & Navigation
      // -------------------------
      const messageEndRef = useRef(null);
      const navigate = useNavigate();
    
      // -------------------------
      // Detect Mobile (only once, so it doesn't flip mid-session)
      // -------------------------
      const [mobileLayout] = useState(() =>
        /Mobi|Android/i.test(navigator.userAgent)
      );
    
      // -------------------------
      // Language Codes
      // -------------------------
      const languageCodes = {
        English: 'en-US',
        Español: 'es-ES',
        中文: 'zh-CN',
        Français: 'fr-FR',
        Deutsch: 'de-DE',
        Italiano: 'it-IT',
        日本語: 'ja-JP',
        한국어: 'ko-KR',
        Português: 'pt-BR',
        Русский: 'ru-RU',
      };
    
      // -------------------------
      // OpenAI Key (example)
      // -------------------------
      const OPENAI_API_KEY = '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'; // Replace with a secure mechanism
    
      // ==========================================================================
      // Fetch GPT Response
      // ==========================================================================
      const fetchChatGPTResponse = async (userMessage) => {
        const chatHistory = [
          {
            role: 'system',
            content:
              'You are a assistant that helps users fill out the Calfresh application. Ask one question at a time in this format. Save all the information and provide a summary at the end to allow the user to review. 1. What is your contact email address? 2. What is your full name? 3. What is your phone number? 4. What is your address? 5. Are you homeless yes or no? 6. Is your household’s gross income less than $150 and cash on hand, checking and savings accounts of $100 or less? Yes or No? 7. Have your utilities been shut off or do you have a shut-off notice? Yes or No? 8.Will your food run out in 3 days or less? ',
          },
          ...messages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          })),
          { role: 'user', content: userMessage },
        ];
    
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: chatHistory,
            }),
          });
    
          const data = await response.json();
          const botMessage = data.choices[0].message.content.trim();
    
          // Special check for CalFresh
          if (botMessage === 'CalFreshAccepted') {
            setMessages((prev) => [
              ...prev,
              { sender: 'bot', type: 'calfreshAccepted' },
            ]);
            return;
          }
    
          // Normal Bot Response
          handleBotResponse(botMessage);
        } catch (error) {
          console.error('Error fetching response:', error);
          setMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: 'Sorry, I am having trouble responding at the moment. Please try again later.',
            },
          ]);
        }
      };
    
      // ==========================================================================
      // Handle Bot Response (Translate if needed, else just store & speak)
      // ==========================================================================
      const handleBotResponse = (botMessage) => {
        if (selectedLanguage !== 'English') {
          handleTranslateAndPlayTTS(botMessage);
        } else {
          setMessages((prev) => [...prev, { sender: 'bot', text: botMessage }]);
          playTTS(botMessage);
        }
      };
    
      // ==========================================================================
      // Translate & TTS
      // ==========================================================================
      const handleTranslateAndPlayTTS = async (message) => {
        const translationPrompt = `Translate the following text into ${selectedLanguage}: "${message}"`;
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [{ role: 'system', content: translationPrompt }],
            }),
          });
    
          const data = await response.json();
          const translatedMessage = data.choices[0].message.content;
    
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: message, translation: translatedMessage },
          ]);
    
          // TTS in the translated language
          playTTS(translatedMessage);
        } catch (error) {
          console.error('Error translating:', error);
          setMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: 'Sorry, I am having trouble translating right now.',
            },
          ]);
        }
      };
    
      // ==========================================================================
      // TTS
      // ==========================================================================
      const playTTS = async (text, voiceId = 'pFZP5JQG7iQjIQuC4Bku') => {
        try {
          const audioBlob = await tts11(text, voiceId);
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
        } catch (error) {
          console.error('Error playing TTS audio:', error);
        }
      };
    
      // ==========================================================================
      // Send Message (Desktop only now)
      // ==========================================================================
      const handleSendMessage = () => {
        if (input.trim() !== '') {
          const userMessage = input.trim();
          setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
          setInput('');
          fetchChatGPTResponse(userMessage);
        }
      };
    
      // ==========================================================================
      // Voice Input
      // ==========================================================================
      const handleVoiceInput = () => {
        if (isListening) {
          // Stop listening
          setIsListening(false);
          setSpokenText('');
        } else {
          // Start listening
          setIsListening(true);
    
          const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!SpeechRecognition) {
            console.error('Speech recognition not supported.');
            setSpokenText('Not supported in this browser.');
            setIsListening(false);
            return;
          }
    
          const recognition = new SpeechRecognition();
          recognition.lang = languageCodes[selectedLanguage] || 'en-US';
          recognition.interimResults = false;
          recognition.continuous = false;
    
          recognition.onstart = () => {
            setSpokenText('Listening...');
          };
    
          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSpokenText('');
            setIsListening(false);
    
            if (transcript.trim() !== '') {
              // On mobile, we only have voice input, so add directly
              setMessages((prev) => [...prev, { sender: 'user', text: transcript }]);
              fetchChatGPTResponse(transcript);
            }
          };
    
          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setSpokenText('Could not understand, please try again.');
            setIsListening(false);
          };
    
          recognition.onend = () => {
            setSpokenText('');
            setIsListening(false);
          };
    
          recognition.start();
        }
      };
    
      // ==========================================================================
      // Handle Language Change
      // ==========================================================================
      const handleLanguageChange = (lang) => {
        setSelectedLanguage(lang);
      };
    
      // ==========================================================================
      // On Key Press (Enter to Send) - Desktop only
      // ==========================================================================
      const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          handleSendMessage();
        }
      };
    
      // ==========================================================================
      // On-demand Translation of Bot Messages
      // ==========================================================================
      const handleTranslateMessage = async (messageText, index) => {
        if (isTranslating) return;
        setIsTranslating(true);
    
        const translationPrompt = `You are a helpful assistant that translates text to ${selectedLanguage}. Translate this text: "${messageText}"`;
    
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: translationPrompt,
                },
              ],
            }),
          });
    
          const data = await response.json();
          const translatedMessage = data.choices[0].message.content;
    
          setMessages((prev) => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              translation: translatedMessage,
            };
            return updated;
          });
    
          await playTTS(translatedMessage);
        } catch (error) {
          console.error('Error translating:', error);
        } finally {
          setIsTranslating(false);
        }
      };
    
      // ==========================================================================
      // Auto-scroll
      // ==========================================================================
      useEffect(() => {
        if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, [messages]);
    
      // ==========================================================================
      // RENDER HELPER: Chat Messages
      // ==========================================================================
      const renderMessages = () => {
        return messages.map((message, index) => {
          // Special UI for CalFresh
          if (message.type === 'calfreshAccepted') {
            return (
              <div key={index} className="flex mb-4 items-center justify-start w-full">
                <div className="max-w-sm w-auto p-4 rounded-lg shadow bg-green-100 text-green-800">
                  <p className="mb-2 font-semibold">CalFresh Application</p>
                  <p className="mb-4">
                    We’re ready to help you fill out the CalFresh application.
                  </p>
                  <button
                    onClick={() => navigate('/resources/calfresh')}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Fill Out the Form
                  </button>
                </div>
              </div>
            );
          }
    
          // Normal Bot/User Messages
          return (
            <div
              key={index}
              className={`flex mb-4 items-center w-full ${
                message.sender === 'bot' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-sm w-auto px-4 py-2 rounded-lg shadow ${
                  message.sender === 'bot'
                    ? 'bg-white text-gray-800'
                    : 'bg-cyan-400 text-white'
                }`}
              >
                {message.text}
                {message.translation && (
                  <div className="mt-2 text-sm text-gray-600">
                    {message.translation}
                  </div>
                )}
    
                {message.sender === 'bot' && message.text && (
                  <button
                    onClick={() => handleTranslateMessage(message.text, index)}
                    className="mt-2 text-xs text-blue-500 flex items-center"
                  >
                    <TranslateIcon className="h-5 w-5 mr-1" />
                    Translate
                  </button>
                )}
              </div>
            </div>
          );
        });
      };
    
      // ==========================================================================
      // MOBILE LAYOUT - Voice Only
      // ==========================================================================
      const MobileLayout = () => {
        return (
          <div className="flex flex-col w-full h-screen overflow-hidden">
            {/* Header */}
            <nav className="flex items-center justify-between h-12 px-4 bg-white border-b">
              <img src={freshroadlogo} alt="Fresh Road Logo" className="w-24 h-auto" />
              <button
                onClick={() => navigate(-1)}
                className="text-sm font-semibold text-gray-900 hover:text-cyan-500 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </nav>
      
            {/* Chat Body */}
            <div
              className="flex-grow overflow-y-auto overflow-x-hidden bg-gray-100 px-4 pt-3 pb-20 w-full"
            >
              {renderMessages()}
              <div ref={messageEndRef} />
            </div>
      
            {/* Bottom bar: Voice only + Language selector */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-2 flex items-center justify-start space-x-2">
              {/* Voice button (make it wider) */}
              <button
                onClick={handleVoiceInput}
                className={`px-6 py-2 rounded-lg text-white ${
                  isListening ? 'bg-red-500' : 'bg-cyan-400'
                } hover:bg-cyan-500 flex items-center justify-center`}
                style={{ minWidth: '60px' }} // Extra forced width if needed
              >
                <MicrophoneIcon className="h-5 w-5" />
              </button>
      
              {/* 'Drop-up' Language container - note this is a hack and may not work consistently */}
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="border rounded-lg p-1 text-sm 
                             focus:outline-none 
                             focus:ring-1 focus:ring-cyan-300
                             bg-white"
                  style={{
                    // Attempt to transform the select to open upwards
                    transformOrigin: 'center bottom',
                  }}
                >
                  {Object.keys(languageCodes).map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      };
    
      // ==========================================================================
      // DESKTOP LAYOUT (unchanged)
      // ==========================================================================
      const DesktopLayout = () => {
        return (
          <div className="flex flex-col h-screen">
            {/* Header */}
            <nav
              className="flex justify-between items-center h-16 px-4 bg-white border-b"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10 }}
            >
              <img src={freshroadlogo} alt="Fresh Road Logo" className="w-35 h-8 mr-2" />
              <button
                onClick={() => navigate(-1)}
                className="text-xl font-bold text-gray-900 hover:text-cyan-500 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </nav>
    
            {/* Main Content */}
            <div className="flex-grow flex overflow-hidden mt-16">
              {/* LEFT: Avatar Panel */}
              <div
                className="w-1/3 bg-white rounded-lg shadow flex-shrink-0 flex flex-col"
                style={{ height: 'calc(100vh - 8rem)' }}
              >
                {/* Avatar Image */}
                <div
                  className="flex-grow"
                  style={{
                    backgroundImage: `url(${avatarImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                  }}
                ></div>
    
                {/* Description Section */}
                <div className="p-4 bg-white">
                  <h2 className="text-lg font-bold mb-2 text-center">211 Call Center</h2>
                  <p className="text-center text-sm mb-2">
                    <br />
                  </p>
                  <p className="text-center text-sm">
                    Get assistance with community resources and support.
                  </p>
                  <button
                    className="mt-4 px-4 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 w-full"
                    onClick={() => alert('Change Avatar functionality not implemented yet!')}
                  >
                    Change Avatar
                  </button>
                </div>
              </div>
    
              {/* RIGHT: Chat Body */}
              <div
                className="w-2/3 p-4 bg-gray-100 overflow-y-auto overflow-x-hidden"
                style={{ height: 'calc(100vh - 8rem)' }}
              >
                {renderMessages()}
                <div ref={messageEndRef} />
              </div>
            </div>
    
            {/* Desktop Chat Input (Text + Send + Voice + Language) */}
            <div
              className="flex items-center p-4 bg-white border-t"
              style={{ position: 'sticky', bottom: 0 }}
            >
              <input
                type="text"
                className="flex-grow border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-cyan-300"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleSendMessage}
                className="ml-2 px-4 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 flex items-center"
              >
                <PaperAirplaneIcon className="h-5 w-5 mr-1" />
                Send
              </button>
              <button
                onClick={handleVoiceInput}
                className={`ml-4 px-4 py-2 rounded-lg text-white ${
                  isListening ? 'bg-red-500' : 'bg-cyan-400'
                } hover:bg-cyan-500 flex items-center`}
              >
                <MicrophoneIcon className="h-5 w-5 mr-1" />
                {isListening ? 'Stop' : 'Voice Input'}
              </button>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="ml-4 px-4 py-2 border rounded-lg"
              >
                {Object.keys(languageCodes).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      };
    
      // ==========================================================================
      // Final Return: Only Voice Input on mobile
      // ==========================================================================
      return mobileLayout ? <MobileLayout /> : <DesktopLayout />;
    };
    
    export default ChatFormPage;
    