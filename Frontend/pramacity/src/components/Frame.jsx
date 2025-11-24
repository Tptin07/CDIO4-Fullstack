// src/components/Frame.jsx
export default function Frame({ title, actions, children }) {
  return (
    <div className="frame">
      {(title || actions) && (
        <div className="frame__head">
          {title && <h3>{title}</h3>}
          {actions && <div className="frame__actions">{actions}</div>}
        </div>
      )}
      <div className="frame__body">{children}</div>
    </div>
  );
}
