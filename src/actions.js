export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';
export const SET_SUMMARY = 'SET_SUMMARY';
export const CLEAR_SUMMARY = 'CLEAR_SUMMARY';

// Use local API endpoint (works with Netlify dev or production)
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate summary. Please try again.');
    }

    const { summary } = await response.json();

    if (Array.isArray(summary) && summary.length > 0 && summary[0].summary_text) {
      dispatch(setSummary(summary[0].summary_text));
    } else if (typeof summary === 'string') {
      dispatch(setSummary(summary));
    } else {
      throw new Error('Unexpected response format from AI service.');
    }
  } catch (error) {
    dispatch(setError(error.message || 'An error occurred while generating the summary.'));
  } finally {
    dispatch(setLoading(false));
  }
};