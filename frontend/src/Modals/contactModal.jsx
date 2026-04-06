// frontend_new/src/components/ContactModal.jsx

import { useState } from "react";
import "./modal.css";

function ContactModal({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    school: "",
    role: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Send to your backend or email service
      console.log("Contact form submitted:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitted(true);
    } catch (err) {
      console.error("Failed to send:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Thanks for your interest!</h2>
            <p>
              We'll be in touch within 24 hours to discuss how TrendWise can
              support your school or district.
            </p>
            <button onClick={onClose} className="primary-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>Contact Sales</h2>
        <p className="modal-subtitle">
          Let's discuss how TrendWise can help your school stay informed.
        </p>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Your Name *
            <input
              type="text"
              placeholder="Jane Smith"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </label>

          <label>
            Work Email *
            <input
              type="email"
              placeholder="jane@school.edu"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </label>

          <label>
            School/District Name *
            <input
              type="text"
              placeholder="Springfield High School"
              value={formData.school}
              onChange={(e) =>
                setFormData({ ...formData, school: e.target.value })
              }
              required
            />
          </label>

          <label>
            Your Role *
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              required
            >
              <option value="">Select your role</option>
              <option value="teacher">Teacher</option>
              <option value="administrator">School Administrator</option>
              <option value="counselor">School Counselor</option>
              <option value="it">IT Director</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            Message (Optional)
            <textarea
              placeholder="Tell us about your needs..."
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows="4"
            />
          </label>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactModal;
