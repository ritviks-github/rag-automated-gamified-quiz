import React from "react";
import { useNavigate } from "react-router-dom";

export default function TermsAndPrivacy() {
  const navigate = useNavigate();

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div
        className="card border-0 shadow-lg p-4"
        style={{
          width: "90%",
          maxWidth: "800px",
          borderRadius: "20px",
          background: "linear-gradient(145deg, #ffffff, #f7f7f7)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1828/1828743.png"
            alt="policy icon"
            width="80"
            height="80"
            className="mb-3"
          />
          <h2 className="fw-bold">Terms & Privacy Policy</h2>
          <p className="text-muted small mb-0">
            Please review our terms of service and privacy commitments.
          </p>
        </div>

        {/* Terms of Service */}
        <section className="mb-4">
          <h4 className="fw-semibold mb-3 text-primary">
            📜 Terms of Service
          </h4>
          <p className="text-muted small">
            By using this platform, you agree to comply with all academic and
            institutional guidelines. You must provide accurate information
            during signup and must not engage in any activity that could
            compromise the platform’s integrity, such as cheating,
            impersonation, or unauthorized access.
          </p>
          <ul className="text-muted small ps-3">
            <li>Do not share your login credentials with others.</li>
            <li>Do not attempt to modify or tamper with system files or data.</li>
            <li>Respect the privacy and intellectual property of others.</li>
            <li>
              Violations may lead to suspension or permanent account removal.
            </li>
          </ul>
        </section>

        {/* Privacy Policy */}
        <section className="mb-4">
          <h4 className="fw-semibold mb-3 text-primary">
            🔒 Privacy Policy
          </h4>
          <p className="text-muted small">
            We respect your privacy and ensure that your personal information
            remains protected. Your data, including name, email, institution,
            and course details, is securely stored and used solely for academic
            and testing purposes within this application.
          </p>
          <ul className="text-muted small ps-3">
            <li>
              Your information will never be sold or shared with third parties.
            </li>
            <li>
              Profile pictures and test data are stored securely in our
              database.
            </li>
            <li>
              Passwords are encrypted using industry-standard hashing techniques.
            </li>
            <li>
              You may request data removal or modification by contacting support.
            </li>
          </ul>
        </section>

        {/* Updates Section */}
        <section className="mb-4">
          <h4 className="fw-semibold mb-3 text-primary">🕓 Policy Updates</h4>
          <p className="text-muted small">
            We may update these policies periodically to improve security or
            reflect changes in institutional requirements. All updates will be
            communicated to users via in-app notifications or email.
          </p>
        </section>

        {/* Footer */}
        <div className="text-center mt-4">
          <button
            className="btn btn-primary fw-semibold px-4 py-2"
            style={{ borderRadius: "10px" }}
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
