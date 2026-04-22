export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';
export const SET_SUMMARY = 'SET_SUMMARY';
export const CLEAR_SUMMARY = 'CLEAR_SUMMARY';

const API_URL = '/api/summarize';

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error
});

export const setSummary = (summary) => ({
  type: SET_SUMMARY,
  payload: summary
});

export const clearSummary = () => ({
  type: CLEAR_SUMMARY
});

export const summarizeText = (text) => async (dispatch) => {
  if (!text || text.trim().length < 50) {
    dispatch(setError('Please enter at least 50 characters to summarize.'));
    return;
  }

  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response:', textResponse.substring(0, 500));
      throw new Error('Server returned an invalid response. Please try again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    const { summary } = data;

    if (Array.isArray(summary) && summary.length > 0 && summary[0].summary_text) {
      dispatch(setSummary(summary[0].summary_text));
    } else if (typeof summary === 'string') {
      dispatch(setSummary(summary));
    } else {
      throw new Error('Unexpected response format from AI service.');
    }
  } catch (error) {
    console.error('Summarize error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      dispatch(setError('Network error. Please check your connection and try again.'));
    } else {
      dispatch(setError(error.message || 'An error occurred while generating the summary.'));
    }
  } finally {
    dispatch(setLoading(false));
  }
};