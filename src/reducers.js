const initialState = { summary: '' };

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'SUMMARIZE_TEXT':
      return { ...state, summary: action.payload };
    default:
      return state;
  }
}