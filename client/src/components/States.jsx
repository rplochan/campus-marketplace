export const EmptyState = ({ title, text, children }) => (
  <div className="state card"><h2>{title}</h2><p className="muted">{text}</p>{children}</div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="state card" role="alert">
    <h2>Something went wrong</h2>
    <p className="error">{message}</p>
    {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
  </div>
);

export const CardSkeletons = ({ n = 8 }) => (
  <div className="grid">{Array.from({ length: n }, (_, i) => <div key={i} className="skeleton" />)}</div>
);