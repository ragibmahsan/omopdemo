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
import SendIcon from '@mui/icons-material/Send';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import PersonIcon from '@mui/icons-material/Person';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";



const App = ({ signOut, user }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
      // Get the current session to retrieve the JWT token
      const { tokens } = await fetchAuthSession();
      const token = tokens.idToken.toString();

      // Get current user
      const user = await getCurrentUser();

      // Create Lambda client
      const lambdaClient = new LambdaClient({
        region: "us-east-1", // replace with your region
        credentials: {
          accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        }
      });

      // Prepare the Lambda invocation
      const command = new InvokeCommand({
        FunctionName: "IST2SQL", // replace with your Lambda function name
        Payload: JSON.stringify({ 
          question: input,
          token: token,
          userId: user.userId
        }),
      });

      // Invoke Lambda
      const response = await lambdaClient.send(command);
      
      // Parse the response
      const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload));
      const data = JSON.parse(responsePayload.body);

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
      console.error('Detailed error:', error);
      const errorMessage = { 
        text: `Error: ${error.message}`,
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
        {/* Header with User Info */}
        <Box sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MedicalInformationIcon />
            <Typography variant="h6">Healthcare SQL Assistant</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user.attributes.email}
            </Typography>
            <Button 
              color="inherit" 
              onClick={async () => {
                try {
                  await signOut();
                } catch (error) {
                  console.log('error signing out:', error);
                }
              }}
              size="small"
              variant="outlined"
            >
              Sign out
          </Button>

          </Box>
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

export default withAuthenticator(App);
