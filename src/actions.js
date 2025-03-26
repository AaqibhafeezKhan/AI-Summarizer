export const summarizeText = (text) => async (dispatch) => {
  const summary = text.split(' ').slice(0, 10).join(' ') + '...'; // Mock summary
  dispatch({ type: 'SUMMARIZE_TEXT', payload: summary });
};