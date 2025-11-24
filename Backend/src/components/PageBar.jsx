// src/components/PageBar.jsx
export default function PageBar({ title, subtitle, right }) {
  return (
    <div className="pagebar">
      <div className="container pagebar__wrap">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {right && <div className="pagebar__right">{right}</div>}
      </div>
    </div>
  );
}
