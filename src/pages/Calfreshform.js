import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import freshroadlogo from '../images/freshroadlogo.png';
import avatarImage from '../images/callrep.png';
import { PaperAirplaneIcon, MicrophoneIcon, TranslateIcon, SpeakerWaveIcon } from '@heroicons/react/outline';
import { tts11 } from '../api/elevenlabs';



const ChatFormPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "I am here to help you fill out the Calfresh application. Please provide me with the necessary information to get started. Please provide me with your contact email address.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();


  


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
    const apiKey = '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'; // Replace with your actual API key
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
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: chatHistory,
        }),
      });
  
      const data = await response.json();
      const botMessage = data.choices[0].message.content;
  
      if (selectedLanguage !== 'English') {
        handleTranslateAndPlayTTS(botMessage);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: botMessage },
        ]);
        playTTS(botMessage);
      }
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Sorry, I am having trouble responding at the moment. Please try again later.' },
      ]);
    }
  };

  const handleTranslateAndPlayTTS = async (message) => {
    const apiKey = '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'; // Replace with your actual API key
    const translationPrompt = `Translate the following text into ${selectedLanguage}: "${message}"`;
  
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
            { role: 'system', content: translationPrompt },
          ],
        }),
      });
  
      const data = await response.json();
      const translatedMessage = data.choices[0].message.content;
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: message, translation: translatedMessage },
      ]);
  
      playTTS(translatedMessage); // Play only the translated message
    } catch (error) {
      console.error('Error translating message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Sorry, I am having trouble translating the response at the moment.' },
      ]);
    }
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // Run whenever the messages array updates

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
        setIsListening(false);
  
        // Automatically send the message
        if (transcript.trim() !== '') {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'user', text: transcript.trim() },
          ]);
          fetchChatGPTResponse(transcript.trim());
        }
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
      await playTTS(translatedMessage, 'pFZP5JQG7iQjIQuC4Bku'); // Replace with the desired translation voice ID
    } catch (error) {
      console.error('Error translating message:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
    {/* Header */}
<nav
  className="flex justify-between items-center h-16 px-4 bg-white border-b"
  style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10 }}
>
  <img src={freshroadlogo} alt="Fresh Road Logo" className="w-35 h-8 mr-2" />
  <button
    // eslint-disable-next-line no-undef
    onClick={() => navigate(-1)} // Goes back to the previous page
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19l-7-7 7-7"
      />
    </svg>
    Back
  </button>
</nav>

  
    {/* Main Content */}
    <div
      className="flex-grow flex overflow-hidden mt-16"
    >
    {/* Feature Section */}
<div
  className="w-1/3 bg-white rounded-lg shadow flex-shrink-0 flex flex-col"
  style={{ height: 'calc(100vh - 8rem)' }}
>
  {/* Avatar Image */}
  <div
    className="flex-grow"
    style={{
      backgroundImage: `url(${avatarImage})`, // Replace with the correct image path
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      width: '100%',
    }}
  ></div>

  {/* Description Section */}
  <div className="p-4 bg-white">
    <h2 className="text-lg font-bold mb-2 text-center">Calfresh Application Assistant</h2>
    <p className="text-center text-sm mb-2">
      <br />
    </p>
    <p className="text-center text-sm">
    Get assistance with completing the Calfresh applications.
    </p>
    <button
      className="mt-4 px-4 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 w-full"
      onClick={() => alert('Change Tutor functionality not implemented yet!')}
    >
      Change Avatar
    </button>
  </div>
</div>
  
     {/* Chat Body */}
<div
  className="w-2/3 p-4 bg-gray-100 overflow-y-auto"
  style={{ height: 'calc(100vh - 8rem)' }}
>
  {messages.map((message, index) => (
    <div
      key={index}
      className={`flex mb-4 items-center ${
        message.sender === 'bot' ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Avatar Section */}
      {/* {message.sender === 'bot' && (
        <div className="hidden sm:block mr-4">
          <img
            src={avatarImage}
            alt="Chat Bot Avatar"
            className="w-16 h-16 rounded-full border border-gray-300"
          />
        </div>
      )} */}
      {/* Message Section */}
      <div
        className={`max-w-xs px-4 py-2 rounded-lg shadow ${
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
        {message.sender === 'bot' && (
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
  ))}
  {/* Auto-Scroll Target */}
  <div ref={messageEndRef} />
</div>
    </div>
  
    {/* Chat Input */}
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
        <PaperAirplaneIcon className="h-5 w-5 mr-1" /> Send
      </button>
      <button
        onClick={handleVoiceInput}
        className={`ml-4 px-4 py-2 rounded-lg text-white ${
          isListening ? 'bg-red-500' : 'bg-cyan-400'
        } hover:bg-cyan-500 flex items-center`}
      >
        <MicrophoneIcon className="h-5 w-5 mr-1" />{' '}
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

export default ChatFormPage;
