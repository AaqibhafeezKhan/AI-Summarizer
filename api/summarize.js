const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: 'Text must be at least 50 characters' });
    }

    const truncatedText = text.length > 1024 ? text.substring(0, 1024) : text;

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

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const textResponse = await response.text();
          console.log('Non-JSON response:', textResponse.substring(0, 200));
          throw new Error('Model is loading, please retry in a few seconds');
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0 && data[0].summary_text) {
          return res.status(200).json({ summary: data });
        }

        if (data.estimated_time) {
          console.log(`Model loading, estimated time: ${data.estimated_time}s, attempt ${attempt + 1}`);
          if (attempt < MAX_RETRIES - 1) {
            await sleep(RETRY_DELAY);
            continue;
          }
          throw new Error('Model is still loading. Please try again in a few seconds.');
        }

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
    return res.status(500).json({
      error: error.message || 'Failed to generate summary'
    });
  }
}
