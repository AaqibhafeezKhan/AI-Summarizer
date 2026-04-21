import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { summarizeText, clearSummary } from './actions';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const { summary, loading, error } = useSelector(state => state);
  const dispatch = useDispatch();

  const handleSummarize = () => {
    dispatch(summarizeText(text));
  };

  const handleClear = () => {
    setText('');
    dispatch(clearSummary());
  };

  const charCount = text.length;
  const minChars = 50;

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>AI Summarizer</h1>
          <p className="subtitle">Transform long text into concise summaries using AI</p>
        </header>

        <div className="card input-section">
          <label className="label">Enter text to summarize (minimum {minChars} characters)</label>
          <textarea
            className="textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your article, essay, or any long text here..."
            rows={10}
            disabled={loading}
          />
          <div className="char-count">
            <span className={charCount < minChars ? 'error-text' : ''}>
              {charCount} / {minChars} characters
            </span>
          </div>

          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={handleSummarize}
              disabled={loading || charCount < minChars}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Summarizing...
                </>
              ) : (
                'Summarize'
              )}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {summary && (
          <div className="card output-section">
            <h2 className="output-title">Summary</h2>
            <p className="summary-text">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;