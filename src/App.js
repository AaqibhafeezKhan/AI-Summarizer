import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { summarizeText } from './actions';

function App() {
  const [text, setText] = useState('');
  const summary = useSelector(state => state.summary);
  const dispatch = useDispatch();

  const handleSummarize = () => {
    dispatch(summarizeText(text));
  };

  return (
    <div>
      <h1>AI Summarizer</h1>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleSummarize}>Summarize</button>
      <h2>Summary:</h2>
      <p>{summary}</p>
    </div>
  );
}

export default App;