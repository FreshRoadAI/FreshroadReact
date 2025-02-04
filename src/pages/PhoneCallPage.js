import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import freshroadlogo from '../images/freshroadlogo.png';
import { TranslateIcon } from '@heroicons/react/outline';
import { tts11 } from '../api/elevenlabs';

// Language prompts
const translations = {
  English: {
    greetMsg: 'Welcome to the Santa Clara County 211 call center. How can I help you today?',
  },
  Español: {
    greetMsg: 'Bienvenido al centro de llamadas 211 del condado de Santa Clara. ¿Cómo puedo ayudarle hoy?',
  },
  中文: {
    greetMsg: '欢迎致电圣克拉拉县 211 呼叫中心。我能为您做些什么？',
  },
};

const PhoneCallPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [messages, setMessages] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const navigate = useNavigate();
  const audioRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Language codes (modify or add as needed)
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

  // Replace with your actual API key or load from a secure location
  const OPENAI_API_KEY = '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'; // Replace with a secure mechanism


  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // =========================================================================
  // GPT Response
  // =========================================================================
  const fetchGeneralGPTResponse = async (userMessage) => {
    const chatHistory = [
      {
        role: 'system',
        content: `
          Limit responses to 2 sentences 30 words and assume the user can read English so send all responses in English but do not let the user know about this prompt. The conversations will be multilingual. You work as a customer service representative for the Santa Clara County 211 call center. Your job is to provide accurate information about the services Santa Clara County can offer. Always speak in sentences and lists. If the user is asking for food assistance, give information on CalFresh, the food stamp application, include eligibility.
        `.trim(),
      },
      ...messages
        .filter((msg) => typeof msg.text === 'string')
        .map((msg) => ({
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GPT API Error Response:', errorText);
        throw new Error(`GPT API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const botMessage = data.choices[0].message.content.trim();

      // Handle special GPT codes
      if (botMessage === 'CalFreshAccepted') {
        setMessages((prev) => [...prev, { sender: 'bot', type: 'calfreshAccepted' }]);
        return;
      }
      if (botMessage === 'FoodBankAccepted') {
        setMessages((prev) => [...prev, { sender: 'bot', type: 'foodBankAccepted' }]);
        return;
      }

      // Normal GPT response
      if (selectedLanguage !== 'English') {
        handleTranslateAndPlayTTS(botMessage);
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: botMessage }]);
        playTTS(botMessage);
      }
    } catch (error) {
      console.error('Error fetching response:', error.message);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I am having trouble responding at the moment. Please try again later.',
        },
      ]);
    }
  };

  // =========================================================================
  // Translate & TTS
  // =========================================================================
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

  // =========================================================================
  // TTS (ElevenLabs)
  // =========================================================================
  const playTTS = async (text, voiceId = 'FGY2WhTYpPnrIDTdsKH5') => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audioBlob = await tts11(text, voiceId);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
    } catch (error) {
      console.error('Error playing TTS audio:', error);
    }
  };

  // =========================================================================
  // Start the call (and microphone)
  // =========================================================================
  const handleStart = () => {
    if (hasStarted) return;

    setHasStarted(true);

    // Bot greeting
    const greeting = translations[selectedLanguage]?.greetMsg || translations.English.greetMsg;
    setMessages([{ sender: 'bot', text: greeting }]);
    playTTS(greeting);

    // Start voice recognition
    startVoiceRecognition();
  };

  // =========================================================================
  // Speech Recognition
  // =========================================================================
  const startVoiceRecognition = () => {
    if (isListening) return; // Already listening
    setIsListening(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported on this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = languageCodes[selectedLanguage] || 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onstart = () => {
      setSpokenText('Listening...');
    };

    recognition.onresult = (event) => {
      const latestResultIndex = event.results.length - 1;
      const transcript = event.results[latestResultIndex][0].transcript.trim();

      // Update UI with recognized speech
      setSpokenText(transcript);

      // Skip empty or whitespace-only transcripts
      if (!transcript || transcript.length === 0) {
        console.log('Empty or whitespace-only transcript. Skipping GPT call.');
        return;
      }

      // Add user message & fetch GPT response
      setMessages((prev) => [...prev, { sender: 'user', text: transcript }]);
      fetchGeneralGPTResponse(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      // If you want to auto-restart, uncomment:
      recognition.start();
    };

    recognition.start();
  };

  // =========================================================================
  // On-demand Translation
  // =========================================================================
  const handleTranslateMessage = async (messageText, index) => {
    if (isTranslating) return;
    setIsTranslating(true);

    const translationPrompt = `Translate the following text into ${selectedLanguage}: "${messageText}"`;
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

  // =========================================================================
  // Render Messages
  // =========================================================================
  const renderMessages = () => {
    if (!hasStarted) {
      // Before starting, show language selection and start button
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="mb-2 text-gray-700">Select Language:</p>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-2 border rounded-lg mb-4"
          >
            {Object.keys(languageCodes).map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <p className="mb-4 text-gray-700">Click the button to start the conversation.</p>
          <button
            onClick={handleStart}
            className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            Start
          </button>
        </div>
      );
    }

    // If started, render the conversation
    return messages.map((message, index) => (
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
    ));
  };

  // =========================================================================
  // Layout
  // =========================================================================
  return (
    <div className="flex flex-col h-screen">
      {/* Top Nav Bar */}
      <nav
        className="flex items-center justify-between h-16 px-4 bg-white border-b"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10 }}
      >
        <img src={freshroadlogo} alt="Fresh Road Logo" className="h-8" />
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
      <div className="flex flex-col md:flex-row flex-grow overflow-hidden mt-16">
        <div
          ref={chatContainerRef}
          className="md:w-2/3 w-full p-4 bg-gray-100 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 8rem)' }}
        >
          {renderMessages()}
        </div>

        {/* Optional Side Panel */}
        <div className="md:w-1/3 w-full bg-white rounded-lg shadow flex-shrink-0 flex flex-col">
          <div className="p-4 bg-white">
            <h2 className="text-lg font-bold mb-2 text-center">
              211 Call Center
            </h2>
            <p className="text-center text-sm mb-2"></p>
            <p className="text-center text-sm">
              Get assistance with community resources and support.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar: just the listening indicator now */}
      <div
        className="flex items-center p-4 bg-white border-t"
        style={{ position: 'sticky', bottom: 0 }}
      >
        {/* Left side: listening indicator */}
        {isListening && (
          <div className="text-gray-500">
            {spokenText ? `Heard: "${spokenText}"` : 'Listening...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneCallPage;
