import React, { useState } from 'react';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const lambdaClient = new LambdaClient({
        region: "us-east-1",
        credentials: fromCognitoIdentityPool({
          client: new CognitoIdentityClient({ region: "us-east-1" }),
          identityPoolId: "us-east-1:27acef8c-f49c-44f8-8d4f-482000470bb4"
        }),
      });

      const command = new InvokeCommand({
        FunctionName: "IST2SQL",
        Payload: JSON.stringify({ question: input }),
      });

      const response = await lambdaClient.send(command);
      const decodedPayload = new TextDecoder().decode(response.Payload);
      const parsedResponse = JSON.parse(decodedPayload);
      const data = JSON.parse(parsedResponse.body);

      const botMessage = { 
        text: `SQL Query: ${data.sql_query}\n\nSummary: ${data.summary}`, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        text: 'Sorry, I encountered an error processing your request.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>OMOP Healthcare Chatbot</h1>
        <div className="chat-container">
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-content">
                  Thinking...
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about healthcare data..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      </header>
    </div>
  );
}

export default App;
