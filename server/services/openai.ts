// openai.ts
import axios from 'axios';

export async function generateChatResponse(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  systemPrompt?: string
) {
  try {
    // Format messages for the provider2api
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add system prompt if it's not already included
    if (systemPrompt && !messages.some(msg => msg.role === 'system')) {
      formattedMessages.unshift({ role: 'system', content: systemPrompt });
    }

    // Prepare the prompt for the provider2api
    // Convert the chat messages into a single prompt string
    let prompt = '';
    formattedMessages.forEach(msg => {
      if (msg.role === 'system') {
        prompt += `Instructions: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n\n`;
      }
    });
    
    // Add the final prompt for the assistant to respond
    prompt += 'Assistant: ';

    console.log('Sending prompt to provider2api:', prompt);

    // Call the provider2api endpoint
    const response = await axios.post('https://provider2api.onrender.com/api/provider2', {
      prompt: prompt,
      model_id: 'openai/gpt-4o'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Provider2api response:', response.data);

    // Extract the response text - the API returns the response in the error field when success is false
    let responseText = '';
    
    if (response.data && response.data.error) {
      // The actual response is in the error field
      responseText = response.data.error;
    } else if (response.data && response.data.response) {
      // Fallback to response field if it exists
      responseText = response.data.response;
    } else {
      responseText = 'No response received.';
    }
    
    return responseText.trim();
  } catch (error) {
    console.error('API error:', error);
    throw new Error('Failed to generate response');
  }
}
