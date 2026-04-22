import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { summarizeText, clearSummary } from './actions';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const { summary, loading, error } = useSelector(state => state);
  const dispatch = useDispatch();

  const handleSummarize = () => {
    dispatch(summarizeText(text));
  };

  const handleClear = () => {
    setText('');
    dispatch(clearSummary());
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const charCount = text.length;
  const minChars = 50;
  const isValid = charCount >= minChars;
  const compressionRatio = summary && text.length > 0
    ? Math.round(((text.length - summary.length) / text.length) * 100)
    : 0;

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Text Summarizer</h1>
          <p className="subtitle">Extract the essence from long-form content</p>
        </header>

        <div className="card input-section">
          <label className="label">
            Input text <span>(minimum {minChars} characters)</span>
          </label>
          <textarea
            className="textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your article, essay, or any text you'd like to summarize..."
            rows={10}
            disabled={loading}
          />
          <div className="char-count">
            <span className="status">
              <span className={`dot ${isValid ? 'valid' : ''}`}></span>
              <span className={isValid ? '' : 'error-text'}>
                {isValid ? 'Ready' : `Need ${minChars - charCount} more characters`}
              </span>
            </span>
            <span>{charCount.toLocaleString()} chars</span>
          </div>

          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={handleSummarize}
              disabled={loading || !isValid}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
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
            <span className="error-icon">!</span>
            {error}
          </div>
        )}

        {summary && (
          <div className="card output-section">
            <div className="output-header">
              <span className="output-title">Summary</span>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="summary-text">{summary}</p>
            <div className="stats">
              <div className="stat">
                <span>Original</span>
                <span className="stat-value">{text.length.toLocaleString()} chars</span>
              </div>
              <div className="stat">
                <span>Summary</span>
                <span className="stat-value">{summary.length.toLocaleString()} chars</span>
              </div>
              <div className="stat">
                <span>Reduced by</span>
                <span className="stat-value">{compressionRatio}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;