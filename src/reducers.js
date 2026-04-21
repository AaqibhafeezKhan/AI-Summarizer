import { SET_LOADING, SET_ERROR, SET_SUMMARY, CLEAR_SUMMARY } from './actions';

const initialState = {
  summary: '',
  loading: false,
  error: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: action.payload };
    case SET_ERROR:
      return { ...state, error: action.payload };
    case SET_SUMMARY:
      return { ...state, summary: action.payload, error: null };
    case CLEAR_SUMMARY:
      return { ...state, summary: '', error: null };
    default:
      return state;
  }
}