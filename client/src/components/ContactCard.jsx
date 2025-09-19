import React from "react";

export default function ContactCard({ name, linkedin, image }) {
  return (
    <div
      className="card shadow-sm text-center p-3"
      style={{ maxWidth: "300px", margin: "auto", borderRadius: "12px" }}
    >
      <img
        src={image}
        alt={name}
        className="rounded-circle mx-auto d-block"
        style={{ width: "200px", height: "200px", objectFit: "cover" }}
      />
      <div className="card-body">
        <h5 className="card-title">{name}</h5>
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-dark btn-sm"
        >
          LinkedIn Profile
        </a>
      </div>
    </div>
  );
}
