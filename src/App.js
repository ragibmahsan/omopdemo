import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  CircularProgress,
  Avatar
} from '@mui/material';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import SendIcon from '@mui/icons-material/Send';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import PersonIcon from '@mui/icons-material/Person';
import { awsConfig } from './aws-config';

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize the Lambda client
  const lambdaClient = new LambdaClient(awsConfig);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user', type: 'question' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
        console.log('Sending request with question:', input);  // Debug log
        
        const command = new InvokeCommand({
            FunctionName: "IST2SQL",
            Payload: JSON.stringify({ question: input }),
        });

        console.log('Invoking Lambda function...');  // Debug log
        const response = await lambdaClient.send(command);
        console.log('Raw Lambda response:', response);  // Debug log
        
        const decodedPayload = new TextDecoder().decode(response.Payload);
        console.log('Decoded payload:', decodedPayload);  // Debug log
        
        const parsedResponse = JSON.parse(decodedPayload);
        console.log('Parsed response:', parsedResponse);  // Debug log
        
        const data = JSON.parse(parsedResponse.body);
        console.log('Final data:', data);  // Debug log

        const sqlMessage = { 
            text: data.sql_query, 
            sender: 'bot', 
            type: 'sql' 
        };
        setMessages(prev => [...prev, sqlMessage]);

        const summaryMessage = {
            text: data.summary,
            sender: 'bot',
            type: 'summary'
        };
        setMessages(prev => [...prev, summaryMessage]);

    } catch (error) {
        console.error('Detailed error:', error);  // More detailed error logging
        const errorMessage = { 
            text: `Error: ${error.message}`, // Include the actual error message
            sender: 'bot',
            type: 'error'
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
};

  return (
    <Container maxWidth="md" sx={{ height: '100vh', py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <MedicalInformationIcon />
          <Typography variant="h6">Healthcare SQL Assistant</Typography>
        </Box>

        {/* Messages Area */}
        <Box sx={{ 
          flexGrow: 1, 
          p: 2, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: '#f5f5f5'
        }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: 1
              }}
            >
              {message.sender === 'bot' && (
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <MedicalInformationIcon />
                </Avatar>
              )}
              <Paper sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: message.sender === 'user' ? 'primary.main' : 'white',
                color: message.sender === 'user' ? 'white' : 'text.primary',
                ...(message.type === 'sql' && {
                  fontFamily: 'monospace',
                  bgcolor: '#f8f9fa',
                  border: '1px solid #dee2e6'
                })
              }}>
                <Typography>{message.text}</Typography>
              </Paper>
              {message.sender === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <PersonIcon />
                </Avatar>
              )}
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
              <CircularProgress size={20} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ 
            p: 2, 
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 1
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask a question about the healthcare database..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            size="small"
          />
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isLoading || !input.trim()}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default App;
