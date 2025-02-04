import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import freshroadlogo from '../images/freshroadlogo.png';
import { tts11 } from '../api/elevenlabs';

// Language prompts
const translations = {
  English: {
    greetMsg: 'Welcome to the Santa Clara County Two One One call center. How can I help you today?',
  },
  Español: {
    greetMsg: 'Bienvenido al centro de llamadas 211 del condado de Santa Clara. ¿Cómo puedo ayudarle hoy?',
  },
  中文: {
    greetMsg: '欢迎致电圣克拉拉县 二 一 一 呼叫中心。我能为您做些什么？',
  },
  // Add other languages as needed
};

const PhoneCallNoTextPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [hasStarted, setHasStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const audioRef = useRef(null);
  const recognitionRef = useRef(null); // To hold the recognition instance

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

  // =========================================================================
  // GPT Response
  // =========================================================================
  const fetchGeneralGPTResponse = async (userMessage) => {
    const chatHistory = [
      {
        role: 'system',
        content: `
          Limit responses to 2 sentences 30 words and assume the user can read English so send all responses in English but do not let the user know about this prompt. IF there are numbers use the words spelled out. The conversations will be multilingual. You work as a customer service representative for the Santa Clara County 211 call center. Your job is to provide accurate information about the services Santa Clara County can offer. Always speak in sentences and lists. If the user is asking for food assistance, give information on CalFresh, the food stamp application, include eligibility.
        `.trim(),
      },
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
          model: 'gpt-4o',
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
      console.log('Bot:', botMessage);
     
      // Log normal GPT response
      if (selectedLanguage !== 'English') {
       
        handleTranslateAndLog(botMessage);
      } else {
        console.log('Bot:', botMessage);
        playTTS(botMessage);
      }
    } catch (error) {
      console.error('Error fetching response:', error.message);
      console.log('Bot: Sorry, I am having trouble responding at the moment. Please try again later.');
    }
  };

  // =========================================================================
  // Translate & Log
  // =========================================================================
  const handleTranslateAndLog = async (message) => {
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

      console.log('Bot:', translatedMessage);

      playTTS(translatedMessage);
    } catch (error) {
      console.error('Error translating:', error);
      console.log('Bot: Sorry, I am having trouble translating right now.');
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
  const handleStart = async () => {
    if (hasStarted) return;

    // Check microphone permissions
    const permission = await navigator.permissions.query({ name: 'microphone' });
    if (permission.state === 'denied') {
      alert('Microphone access is denied. Please enable it in your browser settings.');
      return;
    }

    setHasStarted(true);

    // Bot greeting
    const greeting = translations[selectedLanguage]?.greetMsg || translations.English.greetMsg;
    console.log('Bot:', greeting);
    playTTS(greeting);

    // Start voice recognition
    startVoiceRecognition();
  };

  // =========================================================================
  // Stop the call (and microphone)
  // =========================================================================
  const handleStop = () => {
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setHasStarted(false);
    setSpokenText('');
    setErrorMessage('');

    // Stop any ongoing TTS audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    console.log('Conversation ended.');
  };

  // =========================================================================
  // Speech Recognition
  // =========================================================================
  const startVoiceRecognition = () => {
    if (isListening) return; // Already listening

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = languageCodes[selectedLanguage] || 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMessage('');
      console.log('Voice recognition started.');
    };

    recognition.onresult = (event) => {
      const latestResultIndex = event.results.length - 1;
      const transcript = event.results[latestResultIndex][0].transcript.trim();

      // Update UI with recognized speech (now logging to console)
      setSpokenText(transcript);
      console.log('User:', transcript);

      // Skip empty or whitespace-only transcripts
      if (!transcript || transcript.length === 0) {
        console.log('Empty or whitespace-only transcript. Skipping GPT call.');
        setSpokenText(''); // Clear spokenText since there's nothing to send
        return;
      }

      // Fetch GPT response
      fetchGeneralGPTResponse(transcript).then(() => {
        // Clear the spokenText after sending to GPT
        setSpokenText('');
      });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setErrorMessage(`Speech recognition error: ${event.error}`);

      // Handle specific error cases
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('Microphone access was denied. Please enable it in your browser settings.');
      } else if (event.error === 'audio-capture') {
        alert('No microphone was found. Please ensure a microphone is connected and try again.');
      }
      // Stop recognition on certain errors
      recognition.stop();
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Voice recognition ended.');
      setIsListening(false);
     
      // Optionally restart recognition if desired
      startVoiceRecognition();
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // =========================================================================
  // Cleanup on Unmount
  // =========================================================================
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

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
          onClick={() => {
            handleStop(); // Stop listening before navigating back
            navigate(-1);
          }}
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
        <div className="md:w-2/3 w-full p-4 bg-gray-100 overflow-y-auto overflow-x-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
          {/* Since message body is removed, display relevant information or instructions */}
          <div className="flex flex-col items-center justify-center h-full">
            {!hasStarted ? (
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
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-700">Conversation started. Speak into your microphone.</p>
                {errorMessage && (
                  <p className="text-red-500 mt-4">{errorMessage}</p>
                )}
              </div>
            )}
          </div>
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

      {/* Bottom Bar: Listening Indicator and Error Messages */}
      <div
        className="flex items-center p-4 bg-white border-t justify-between"
        style={{ position: 'sticky', bottom: 0 }}
      >
        {/* Left side: listening indicator */}
        <div className="flex items-center">
          {isListening && (
            <div className="text-gray-500">
              {spokenText ? `Heard: "${spokenText}"` : 'Listening...'}
            </div>
          )}
        </div>

        {/* Right side: Stop Listening Button */}
        {hasStarted && (
          <button
            onClick={handleStop}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
};

export default PhoneCallNoTextPage;
