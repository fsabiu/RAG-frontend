import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/ChatPage.css';
import RAGConfigDisplay from '../components/RAGConfigDisplay';
import { API_ENDPOINTS } from '../config/apiConfig';
import { marked } from 'marked';
import { createParser } from 'eventsource-parser';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [configData, setConfigData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const chatBoxRef = useRef(null);
  const dataFetchedRef = useRef(false);
  
  // Queue to hold incoming tokens
  const tokenQueueRef = useRef([]);
  // Flag to indicate if processing is ongoing
  const isProcessingRef = useRef(false);
  // Minimum delay between tokens in milliseconds
  const MIN_DELAY = 15; // Adjust as needed

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    const fetchAllData = async () => {
      try {
        const [config, template] = await Promise.all([
          fetchData(API_ENDPOINTS.RAG_CONFIG),
          fetchData(API_ENDPOINTS.SETUP_RAG_TEMPLATE)
        ]);

        console.log('Fetched RAG Config:', config);
        console.log('Fetched RAG Template:', template);

        setConfigData(config);
        setMetadata(template.metadata);

        await fetchInitialResponse();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data.');
      }
    };

    fetchAllData();
  }, []);

  const fetchData = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };

  const fetchInitialResponse = async () => {
    const url = API_ENDPOINTS.INIT;
    const data = {
      message: "how are you?",
      genModel: "OCI_CommandRplus"
    };

    console.log(`${new Date().toISOString()} - Sending initial request to:`, url);

    setMessages([{ type: 'system', content: '' }]);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      await handleStreamResponse(response);
    } catch (error) {
      console.error(`${new Date().toISOString()} - Fetch error:`, error);
      updateLastMessage('Error: Failed to get initial response from the server.');
    }
  };

  const handleStreamResponse = async (response) => {
    const parser = createParser(onParse);

    const reader = response.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        console.log(`${new Date().toISOString()} - Received chunk:`, chunk);
        parser.feed(chunk);
      }
    } catch (error) {
      console.error(`${new Date().toISOString()} - Error reading stream:`, error);
      updateLastMessage(prevContent => prevContent + '\nError: Failed to read the response stream.');
    }
  };

  const onParse = (event) => {
    if (event.type === 'event') {
      try {
        const data = JSON.parse(event.data);
        console.log(`${new Date().toISOString()} - Parsed event:`, data);

        if (data.type === 'content') {
          tokenQueueRef.current.push(data.content);
          processQueue();
        } else if (data.type === 'done') {
          console.log(`${new Date().toISOString()} - Response completed`);
        }
      } catch (error) {
        console.error(`${new Date().toISOString()} - Error parsing JSON:`, error);
      }
    }
  };

  const processQueue = useCallback(() => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const processNext = () => {
      if (tokenQueueRef.current.length === 0) {
        isProcessingRef.current = false;
        return;
      }

      const nextToken = tokenQueueRef.current.shift();
      updateLastMessage(prevContent => prevContent + nextToken);
      console.log(`${new Date().toISOString()} - Appended content:`, nextToken);

      setTimeout(processNext, MIN_DELAY);
    };

    processNext();
  }, []);

  const updateLastMessage = (updateFunction) => {
    setMessages(prevMessages => {
      const newMessages = [...prevMessages];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.type === 'system') {
        lastMessage.content = typeof updateFunction === 'function' ? updateFunction(lastMessage.content) : updateFunction;
      } else {
        // If there's no system message, add one
        newMessages.push({ type: 'system', content: typeof updateFunction === 'function' ? updateFunction('') : updateFunction });
      }
      return newMessages;
    });
  };

  const sendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage = { type: 'user', content: inputValue.trim() };
      setMessages(prevMessages => [...prevMessages, newMessage, { type: 'system', content: '' }]);
      setInputValue('');
      await fetchResponse(newMessage.content);
    }
  };

  const fetchResponse = async (message) => {
    const url = API_ENDPOINTS.ASK;
    const data = {
      message: message,
      genModel: 'OCI_CommandRplus',
      conversation: []
    };

    console.log(`${new Date().toISOString()} - Sending request to:`, url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      await handleStreamResponse(response);
    } catch (error) {
      console.error(`${new Date().toISOString()} - Fetch error:`, error);
      updateLastMessage('Error: Failed to get response from the server.');
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-page-container">
      <div className="chat-interface">
        <div className="container">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg" alt="Oracle Logo" className="oracle-logo" />
          <div id="chatBox" ref={chatBoxRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}-message`}>
                <div dangerouslySetInnerHTML={{ __html: marked(msg.content) }} />
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              type="text"
              id="userInput"
              placeholder="Send a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button id="sendButton" onClick={sendMessage}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="bottom-section">
        <aside className="sidebar">
          <RAGConfigDisplay configData={configData} metadata={metadata} error={error} />
        </aside>
        <div className="sources-display">
          <h3>Sources</h3>
          {/* Placeholder for sources content */}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
