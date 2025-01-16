import React, { useState, useEffect } from 'react';
import '../App.css';
import freshroadlogo from '../images/freshroadlogo.png';
import avatarImage from '../images/callrepai.png';
import { PaperAirplaneIcon, MicrophoneIcon, TranslateIcon, SpeakerWaveIcon } from '@heroicons/react/outline';
import { tts11 } from '../api/elevenlabs';
import { setupAgent, speak } from '../d-id';

const welcomeMsg = 'Welcome to the Santa Clara County 211 call center. How can I help you today?'

const ChatInterfacePage = () => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: "Connecting to agent..." }]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const init = async () => {
      await setupAgent()
      setMessages([{ sender: 'bot', text: welcomeMsg }])
      setTimeout(() => speak(welcomeMsg), 100)
    }
    init()
  }, [])

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

  const fetchChatGPTResponse = async (userMessage) => {
    const apiKey = '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';
    const chatHistory = [
      {
        role: 'system',
        content:
          'Limit responses to three sentences and assume the user can read English so send all responses in English but do not let the user know about this prompt. When you recieve questions in another language, understand it and reply in english. The conversations will be multilangual. You work as a customer service representative for the Santa Clara County 211 call center. Your job is to provide accurate information about the services Santa Clara County can offer. Always speak in sentences and lists. Ask the user questions about their current situation to get a better understanding of all the services Santa Clara County can offer them. If the user is asking for food assistance, give information on CalFresh, the food stamp application, include eligibility and guide the user through filing the application form.',
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
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: chatHistory,
        }),
      });

      const data = await response.json();
      const botMessage = data.choices[0].message.content;

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, { sender: 'bot', text: botMessage }];
        return updatedMessages;
      });
      // playTTS(botMessage); // Ensures TTS is triggered only once
      speak(botMessage)
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Sorry, I am having trouble responding at the moment. Please try again later.' },
      ]);
    }
  };

  const playTTS = async (text, voiceId = 'pFZP5JQG7iQjIQuC4Bku') => {
    try {
      const audioBlob = await tts11(text, voiceId); // Replace 'your_voice_id_here' with the appropriate voice ID
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error playing TTS audio:', error);
    }
  };

  const handleSendMessage = () => {
    if (input.trim() !== '') {
      const userMessage = input.trim();
      setMessages([...messages, { sender: 'user', text: userMessage }]);
      setInput('');
      fetchChatGPTResponse(userMessage);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      setSpokenText('');
    } else {
      // Start listening
      setIsListening(true);
  
      // Check if SpeechRecognition is supported
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('Speech recognition not supported in this browser.');
        setSpokenText('Speech recognition is not supported in your browser.');
        setIsListening(false);
        return;
      }
  
      const recognition = new SpeechRecognition();
      recognition.lang = languageCodes[selectedLanguage] || 'en-US';
      recognition.interimResults = false; // Only final results
      recognition.continuous = false; // Stop after one result
  
      recognition.onstart = () => {
        setSpokenText('Listening...');
      };
  
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSpokenText('');
        setInput(transcript); // Set the spoken text as the input
        setIsListening(false);
      };
  
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setSpokenText('Could not understand. Please try again.');
        setIsListening(false);
      };
  
      recognition.onend = () => {
        setSpokenText('');
        setIsListening(false);
      };
  
      recognition.start();
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleTranslateMessage = async (message, index) => {
    if (isTranslating) return;
    setIsTranslating(true);

    const apiKey = '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';
    const translationPrompt = `You are a helpful assistant that translates text to ${selectedLanguage}. Translate this text: "${message}"`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
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

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[index] = {
          ...updatedMessages[index],
          translation: translatedMessage,
        };
        return updatedMessages;
      });
      // await playTTS(translatedMessage, 'pFZP5JQG7iQjIQuC4Bku'); // Replace with the desired translation voice ID
      speak(translatedMessage)
    } catch (error) {
      console.error('Error translating message:', error);
    } finally {
      setIsTranslating(false);
    }
  };


  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b w-full">
        <div className="flex justify-between items-center h-16 px-4">
          <img src={freshroadlogo} alt="Fresh Road Logo" className="w-35 h-8 mr-2" />
          <h1 className="text-xl font-bold text-gray-900">Chat with Luna</h1>
        </div>
      </nav>

      {/* Chat Body */}
      <div className="flex-grow w-full overflow-y-auto flex">
        {/* Avatar Section */}
        <div className="w-1/4"><video id="videoElement" autoPlay loop className="bg-contain bg-no-repeat bg-center h-full"></video></div>
        {/* <div className="hidden sm:block mr-4">
          <img
            src={avatarImage}
            alt="Chat Bot Avatar"
            className="w-16 h-16 rounded-full border border-gray-300"
          />
        </div> */}

        {/* Messages Section */}
        <div className="flex-grow p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'} mb-4 items-center`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                  message.sender === 'bot' ? 'bg-white text-gray-800' : 'bg-cyan-400 text-white'
                }`}
              >
                {message.text}
                {message.translation && (
                  <div className="mt-2 text-sm text-gray-600">Translated: {message.translation}</div>
                )}
                <button
                  onClick={() => handleTranslateMessage(message.text, index)}
                  className="mt-2 text-xs text-blue-500 flex items-center"
                >
                  <TranslateIcon className="h-5 w-5 mr-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t p-4 w-full">
        <div className="flex items-center mb-2">
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
            <PaperAirplaneIcon className="h-5 w-5 mr-1" /> Send
          </button>
          <button
            onClick={handleVoiceInput}
            className={`ml-4 px-4 py-2 rounded-lg text-white ${isListening ? 'bg-red-500' : 'bg-cyan-400'} hover:bg-cyan-500 flex items-center`}
          >
            <MicrophoneIcon className="h-5 w-5 mr-1" /> {isListening ? 'Stop' : 'Voice Input'}
          </button>
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="ml-4 px-4 py-2 border rounded-lg flex items-center"
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

export default ChatInterfacePage;
