import React, { useState, useEffect } from 'react';
import '../styles/ChatPage.css';
import RAGConfigDisplay from '../components/RAGConfigDisplay';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    callCleanEndpoint();
  }, []);

  const sendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage = { type: 'user', content: inputValue.trim() };
      setMessages([...messages, newMessage]);
      setInputValue('');
      await fetchResponse(newMessage.content);
    }
  };

  const fetchResponse = async (message) => {
    const url = 'http://84.235.246.54:5050/ask';
    const data = {
      message: message,
      genModel: 'OCI_CommandRplus',
      conversation: []
    };

    setMessages((prevMessages) => [...prevMessages, { type: 'system', content: 'Assistant: ' }]);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      let botResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.startsWith('data:')) {
            const jsonString = line.slice(5).trim();

            try {
              const jsonData = JSON.parse(jsonString);
              if (jsonData.type === 'content') {
                botResponse += jsonData.content;
                updateLastMessage(botResponse);
              } else if (jsonData.type === 'done') {
                console.log('Response completed');
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      updateLastMessage('Error: Failed to get response from the server.');
    }
  };

  const updateLastMessage = (content) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      updatedMessages[updatedMessages.length - 1].content = content;
      return updatedMessages;
    });
  };

  const callCleanEndpoint = async () => {
    const url = 'http://84.235.246.54:5050/clean_conversation';
    try {
      const response = await fetch(url, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to clean conversation');
      }
      console.log('Conversation cleaned successfully');
    } catch (error) {
      console.error('Error cleaning conversation:', error);
    }
  };

  return (
    <div className="chat-page-container">
      <aside className="sidebar">
        <RAGConfigDisplay />
      </aside>
      <div className="chat-interface">
        <div className="container">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg" alt="Oracle Logo" className="oracle-logo" />
          <div className="right-rail">
            <div id="chatBox">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.type}-message`}>
                  {msg.content}
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
      </div>
    </div>
  );
}

export default ChatPage;
