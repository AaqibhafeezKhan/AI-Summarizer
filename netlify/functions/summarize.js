const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.handler = async (event, context) => {
  // Common headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { text } = JSON.parse(event.body);

    if (!text || text.trim().length < 50) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text must be at least 50 characters' })
      };
    }

    // Truncate very long text
    const truncatedText = text.length > 1024 ? text.substring(0, 1024) : text;

    // Try with retries for model loading
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: truncatedText })
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const textResponse = await response.text();
          console.log('Non-JSON response:', textResponse.substring(0, 200));
          throw new Error('Model is loading, please retry in a few seconds');
        }

        const data = await response.json();

        // Handle model loading state
        if (Array.isArray(data) && data.length > 0 && data[0].summary_text) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ summary: data })
          };
        }

        // Handle estimated_time for model loading
        if (data.estimated_time) {
          console.log(`Model loading, estimated time: ${data.estimated_time}s, attempt ${attempt + 1}`);
          if (attempt < MAX_RETRIES - 1) {
            await sleep(RETRY_DELAY);
            continue;
          }
          throw new Error('Model is still loading. Please try again in a few seconds.');
        }

        // Handle error in response
        if (data.error) {
          throw new Error(data.error);
        }

        throw new Error('Unexpected response format');

      } catch (attemptError) {
        lastError = attemptError;
        if (attempt < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAY);
        }
      }
    }

    throw lastError || new Error('Failed after multiple attempts');

  } catch (error) {
    console.error('Summarize function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Failed to generate summary',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
