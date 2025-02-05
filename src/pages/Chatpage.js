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

const translations = {
  English: {
    greetMsg: 'Welcome to the Santa Clara County 211 call center. How can I help you today?',
    calfreshHeader: 'CalFresh Application',
    calfreshMessage: 'We’re ready to help you fill out the CalFresh application.',
    calfreshButton: 'Fill Out the Form',
    foodbankHeader: 'Food Bank Information',
    foodbankMessage: 'Here’s information about local food banks that can assist you.',
    foodbankButton: 'View Food Banks',
    veteranHeader: 'Veteran Disability Compensation Application',
    veteranMessage: 'We’re ready to help you fill out the Veteran Disability Compensation application.',
    veteranButton: 'Fill Out the Form',
  },
  Español: {
    greetMsg: 'Bienvenido al centro de llamadas 211 del condado de Santa Clara. ¿Cómo puedo ayudarle hoy?',
    calfreshHeader: 'Solicitud de CalFresh',
    calfreshMessage: 'Estamos listos para ayudarle a completar la solicitud de CalFresh.',
    calfreshButton: 'Completar el Formulario',
    foodbankHeader: 'Información del Banco de Alimentos',
    foodbankMessage: 'Aquí hay información sobre bancos de alimentos locales que pueden ayudarle.',
    foodbankButton: 'Ver Bancos de Alimentos',
  },
  中文: {
    greetMsg: '欢迎致电圣克拉拉县 211 呼叫中心。我能为您做些什么？',
    calfreshHeader: 'CalFresh 申请',
    calfreshMessage: '我们可以帮助您完成 CalFresh 申请。',
    calfreshButton: '填写表格',
    foodbankHeader: '食品银行信息',
    foodbankMessage: '以下是可以帮助您的当地食品银行信息。',
    foodbankButton: '查看食品银行',
  },
};

const ChatInterfacePage = () => {
  // -------------------------
  // States
  // -------------------------
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [messages, setMessages] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [conversationMode, setConversationMode] = useState('general');

  // Navigation & Audio
  const navigate = useNavigate();
  const audioRef = useRef(null);

  // Input ref
  const inputRef = useRef(null);

  // Chat container ref
  const chatContainerRef = useRef(null);

  // Language Codes
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

  // OpenAI Key (example)
 const OPENAI_API_KEY = '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'; // Replace with a secure mechanism

  // ==========================================================================
  // 1) SCROLL ONLY ON NEW MESSAGES
  // ==========================================================================
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // Only depends on messages

  // -------------------------
  // Focus the input once user has started
  // -------------------------
  useEffect(() => {
    if (hasStarted) {
      inputRef.current?.focus();
    }
  }, [hasStarted, messages]);

  // ==========================================================================
  // GPT Response - "General"
  // ==========================================================================
  const fetchGeneralGPTResponse = async (userMessage) => {
    const chatHistory = [
      {
        role: 'system',
        content:
          'Limit responses to three sentences, 250 characters or 50 words and assume the user can read English so send all responses in English but do not let the user know about this prompt. The conversations will be multilingual. You work as a customer service representative for the Santa Clara County 211 call center. Your job is to provide accurate information about the services Santa Clara County can offer. Always speak in sentences and lists. If the user is asking for food assistance, give information on CalFresh, the food stamp application, include eligibility. If user agrees to let you help fill out the form, send back only the code "CalFreshAccepted". IF the user wants to know information about food banks send back only the code "FoodBankAccepted". If user wants your help to fill out the Veteran Disability Compensation application, send back only the code "VeteranAccepted".',
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

      // Special responses
      if (botMessage === 'CalFreshAccepted') {
        setMessages((prev) => [...prev, { sender: 'bot', type: 'calfreshAccepted' }]);
        return;
      }
      if (botMessage === 'FoodBankAccepted') {
        setMessages((prev) => [...prev, { sender: 'bot', type: 'foodBankAccepted' }]);
        return;
      }
      if (botMessage.includes('VeteranAccepted')) {
        setMessages((prev) => [...prev, { sender: 'bot', type: 'veteranAccepted' }]);
        return;
      }

      // Normal Bot Response
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

  const prompts = {
    calfresh: 'You are an assistant that helps users fill out the CalFresh application. Ask one question at a time. Save all the information and provide a summary at the end so the user can review it. After the user confirms the information is correct, tell them the next step is to wait for a response from the CalFresh program. The application has been submitted on their behalf. They will receive an email in a few days with further instructions. 1. What is your contact email address? 2. What is your full name? 3. What is your phone number? 4. What is your address? 5. Are you homeless, yes or no? 6. Is your household’s gross income less than $150 and cash on hand, checking and savings accounts of $100 or less? Yes or No? 7. Have your utilities been shut off or do you have a shut-off notice? Yes or No? 8. Will your food run out in 3 days or less?',
    veteran: 'You are an assistant that helps users fill out the Veteran Disability Compensation application. Ask one question at a time. Save all the information and provide a summary at the end so the user can review it. After the user confirms the information is correct, tell them the next step is to wait for a response from the Veteran Disability Compensation program. The application has been submitted on their behalf. They will receive an email in a few days with further instructions. 1. What is your contact email address? 2. What is your full name? 3. What is your phone number? 4. What is your address? 5. What is your social security number (SSN)? 6. Have you ever filed a claim with VA? If yes, what is the VA file number? 7. What is your date of birth? 8. What is your service number? 9. Are you currently a VA employee? 10. Are you currently homeless? 11. Are you claiming any conditions related to toxic exposures? 12. list the current disability(IES) or symptoms that you claim are related to your military service and/or service-connected disability.',
    foodbank: 'You are an assistant that helps users find information about local food banks in Santa Clara County. Kepp your responses to under 3 sentences. Start by asking wha the address of the user and providing the closest food bank to the user. Provide hours of operation, address, eligibility requirements, phone number. Ask clarifying questions if needed, and summarize the information clearly so the user can quickly locate assistance.',
  }

  const fetchGPTResponse = async (prompt, userMessage) => {
    const chatHistory = [
      {
        role: 'system',
        content: prompt,
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

  const fetchCalfreshGPTResponse = userMessage => fetchGPTResponse(prompts.calfresh, userMessage)
  const fetchFoodBankGPTResponse = userMessage => fetchGPTResponse(prompts.foodbank, userMessage)
  const fetchVeteranGPTResponse = userMessage => fetchGPTResponse(prompts.veteran, userMessage)

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

  // -------------------------
  // Simple TTS (ElevenLabs)
  // -------------------------
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

  // ==========================================================================
  // Handle "Start"
  // ==========================================================================
  const handleStart = () => {
    setHasStarted(true);
    const greeting =
      translations[selectedLanguage]?.greetMsg || translations.English.greetMsg;
    setMessages([{ sender: 'bot', text: greeting }]);
    playTTS(greeting);
  };

  // ==========================================================================
  // Send Message
  // ==========================================================================
  const handleSendMessage = () => {
    if (!hasStarted) return;
    if (input.trim() !== '') {
      const userMessage = input.trim();
      setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
      setInput('');
  
      if (conversationMode === 'calfresh') {
        fetchCalfreshGPTResponse(userMessage);
      } else if (conversationMode === 'foodbank') {
        fetchFoodBankGPTResponse(userMessage);
      } else if (conversationMode === 'veteran') {
        fetchVeteranGPTResponse(userMessage);
      } else {
        fetchGeneralGPTResponse(userMessage);
      }
    }
  };

  // ==========================================================================
  // Voice Input
  // ==========================================================================
  const handleVoiceInput = () => {
    if (isListening) {
      // If currently listening, stop listening
      setIsListening(false);
    } else {
      setIsListening(true);

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('Speech recognition not supported.');
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

        if (transcript.trim()) {
          setMessages((prev) => [...prev, { sender: 'user', text: transcript }]);
          if (conversationMode === 'calfresh') {
            fetchCalfreshGPTResponse(transcript);
          } else if (conversationMode === 'veteran') {
            fetchVeteranGPTResponse(transcript);
          } else {
            fetchGeneralGPTResponse(transcript);
          }
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

  // -------------------------
  // Change Language
  // -------------------------
  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
  };

  // -------------------------
  // Key Down (Enter)
  // -------------------------
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ==========================================================================
  // On-demand Translation
  // ==========================================================================
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

  // ==========================================================================
  // RENDER HELPER: Chat Messages
  // ==========================================================================
  const renderMessages = () => {
    if (!hasStarted) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="mb-4 text-gray-700">
            Click the button to start the conversation.
          </p>
          <button
            onClick={handleStart}
            className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            Start
          </button>
        </div>
      );
    }

    return messages.map((message, index) => {
      // CalFresh
      if (message.type === 'calfreshAccepted') {
        const calfreshHeader =
          translations[selectedLanguage]?.calfreshHeader ||
          translations.English.calfreshHeader;
        const calfreshMessage =
          translations[selectedLanguage]?.calfreshMessage ||
          translations.English.calfreshMessage;
        const calfreshButton =
          translations[selectedLanguage]?.calfreshButton ||
          translations.English.calfreshButton;

        return (
          <div key={index} className="flex mb-4 items-center justify-start w-full">
            <div className="max-w-sm w-auto p-4 rounded-lg shadow bg-green-100 text-green-800">
              <p className="mb-2 font-semibold">{calfreshHeader}</p>
              <p className="mb-4">{calfreshMessage}</p>
              <button
                onClick={() => {
                  setConversationMode('calfresh');
                  const introMsg = 'I would like to start the CalFresh application.';
                  setMessages((prev) => [...prev, { sender: 'user', text: introMsg }]);
                  fetchCalfreshGPTResponse(introMsg);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                {calfreshButton}
              </button>
            </div>
          </div>
        );
      }

      // FoodBank
      if (message.type === 'foodBankAccepted') {
        const foodbankHeader = translations[selectedLanguage]?.foodbankHeader 
                              || translations.English.foodbankHeader;
        const foodbankMessage = translations[selectedLanguage]?.foodbankMessage
                              || translations.English.foodbankMessage;
        const foodbankButton = translations[selectedLanguage]?.foodbankButton
                              || translations.English.foodbankButton;
      
        return (
          <div key={index} className="flex mb-4 items-center justify-start w-full">
            <div className="max-w-sm w-auto p-4 rounded-lg shadow bg-blue-100 text-blue-800">
              <p className="mb-2 font-semibold">{foodbankHeader}</p>
              <p className="mb-4">{foodbankMessage}</p>
              <button
                onClick={() => {
                  // 1) Switch conversation mode
                  setConversationMode('foodbank');
                  // 2) Send an intro user message
                  const introMsg = 'I would like more information about local food banks.';
                  setMessages((prev) => [...prev, { sender: 'user', text: introMsg }]);
                  // 3) Call fetchFoodBankGPTResponse
                  fetchFoodBankGPTResponse(introMsg);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {foodbankButton}
              </button>
            </div>
          </div>
        );
      }
console.log(message.type)
      // Veteran
      if (message.type === 'veteranAccepted') {
        const veteranHeader =
          translations[selectedLanguage]?.veteranHeader ||
          translations.English.veteranHeader;
        const veteranMessage =
          translations[selectedLanguage]?.veteranMessage ||
          translations.English.veteranMessage;
        const veteranButton =
          translations[selectedLanguage]?.veteranButton ||
          translations.English.veteranButton;

        return (
          <div key={index} className="flex mb-4 items-center justify-start w-full">
            <div className="max-w-sm w-auto p-4 rounded-lg shadow bg-green-100 text-green-800">
              <p className="mb-2 font-semibold">{veteranHeader}</p>
              <p className="mb-4">{veteranMessage}</p>
              <button
                onClick={() => {
                  setConversationMode('veteran');
                  const introMsg = 'I would like to start the Veteran Disability Compensation application.';
                  setMessages((prev) => [...prev, { sender: 'user', text: introMsg }]);
                  fetchVeteranGPTResponse(introMsg);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                {veteranButton}
              </button>
            </div>
          </div>
        );
      }

      // Normal messages
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
              <div className="mt-2 text-sm text-gray-600">{message.translation}</div>
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
  // RESPONSIVE LAYOUT (Mobile/Desktop) USING TAILWIND
  // ==========================================================================
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

      {/* Main Content Area */}
      {/* 
        - On mobile (<768px), this becomes flex-col
        - On desktop (>=768px), this becomes flex-row
      */}
      <div className="flex flex-col md:flex-row flex-grow overflow-hidden mt-16">
        {/* LEFT PANEL: 
             - On mobile, it's shown at the top or hidden?
             - We'll keep it shown. We'll make it full width on mobile,
               and 1/3 width on desktop.
        */}
        <div className="md:w-1/3 w-full bg-white rounded-lg shadow flex-shrink-0 flex flex-col">
          <div
            className="flex-grow"
            style={{
              backgroundImage: `url(${avatarImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              width: '100%',
            }}
          />
          <div className="p-4 bg-white">
            <h2 className="text-lg font-bold mb-2 text-center">211 Call Center</h2>
            <p className="text-center text-sm mb-2"></p>
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

        {/* RIGHT PANEL: Chat Content */}
        <div
          ref={chatContainerRef}
          className="md:w-2/3 w-full p-4 bg-gray-100 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 8rem)' }}
        >
          {renderMessages()}
        </div>
      </div>

      {/* Bottom Chat Input Bar */}
      <div
        className="flex flex-wrap items-center p-4 bg-white border-t gap-2"
        style={{ position: 'sticky', bottom: 0 }}
      >
        <input
          ref={inputRef}
          type="text"
          className="flex-grow border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-cyan-300"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!hasStarted}
        />

        <button
          onClick={handleSendMessage}
          className={`px-4 py-2 text-white rounded-lg flex items-center ${
            hasStarted ? 'bg-cyan-400 hover:bg-cyan-500' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <PaperAirplaneIcon className="h-5 w-5 mr-1" />
          Send
        </button>

        <button
          onClick={handleVoiceInput}
          className={`px-4 py-2 rounded-lg text-white flex items-center ${
            isListening
              ? 'bg-red-500'
              : hasStarted
              ? 'bg-cyan-400 hover:bg-cyan-500'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <MicrophoneIcon className="h-5 w-5 mr-1" />
          {isListening ? 'Stop' : 'Voice Input'}
        </button>

        <select
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="px-4 py-2 border rounded-lg"
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

export default ChatInterfacePage;
