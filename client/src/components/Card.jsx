import React from "react";

export default function Card({title,description}) {
  return (
    <div className="card shadow-sm p-4 text-center" style={{ maxWidth: "400px", margin: "auto" }}>
      <h1 className="h4 mb-3">{title}</h1>
      <p className="text-muted">
        {description}
      </p>
    </div>
  );
}
