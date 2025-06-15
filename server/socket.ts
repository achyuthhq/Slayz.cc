import { Server } from 'socket.io';
import { generateChatResponse } from './services/openai';

export function setupSocketIO(server: any) {
  const io = new Server(server, {
    path: '/socket.io',
    transports: ['websocket'],
  });

  io.on('connection', (socket) => {
    console.log('Client connected');

    let messageHistory: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];

    socket.on('user-message', async ({ message, systemPrompt }) => {
      try {
        // Initialize history with system prompt if provided
        if (systemPrompt && messageHistory.length === 0) {
          messageHistory.push({ role: 'system', content: systemPrompt });
        }
        
        // Add user message to history
        messageHistory.push({ role: 'user', content: message });

        // Generate response using Hugging Face
        const response = await generateChatResponse(messageHistory, systemPrompt);

        // Add assistant response to history
        messageHistory.push({ role: 'assistant', content: response });

        // Keep only last 10 messages to prevent context from getting too long
        if (messageHistory.length > 10) {
          messageHistory = messageHistory.slice(-10);
        }

        // Send response back to client
        socket.emit('bot-response', response);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('bot-response', 'I apologize, but I encountered an error processing your request.');
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      messageHistory = [];
    });
  });

  return io;
}
