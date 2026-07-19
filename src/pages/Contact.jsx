import React, { useState } from 'react';

/**
 * Contact Page
 * Rendered at the "/contact" route.
 *
 * Demonstrates two meaningful uses of useState (per Practical 2):
 * 1. `showTip`      - toggles the visibility of a small help tooltip (UI visibility state).
 * 2. `formData`      - a controlled form tied to text inputs, updated on every keystroke.
 *
 * Supplementary problem also implemented here: a live character count
 * below the message textarea, derived straight from `formData.message`.
 */
function Contact() {
  // Controlled form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [showStatus, setShowStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // UI-visibility state: toggles a small help tooltip on/off
  const [showTip, setShowTip] = useState(false);

  const MAX_MESSAGE_LENGTH = 500;

  // Handler for form field text changes (keeps input "controlled")
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handler for form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setStatusMessage('Please fill in all required fields.');
      setShowStatus(true);
      return;
    }

    setStatusMessage('Sending your message...');
    setShowStatus(true);

    setTimeout(() => {
      setStatusMessage(`Thank you, ${formData.name}! Your message has been sent successfully.`);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      setTimeout(() => {
        setShowStatus(false);
      }, 4000);
    }, 1500);
  };

  return (
    <section id="contact" className="section">
      <div className="glow-blur" style={{ top: '40%', left: '5%' }} />

      <span className="section-subtitle">Reach out</span>
      <h2 className="section-title">Contact Me</h2>

      <div className="contact-container">
        <div className="contact-grid">

          {/* Contact info cards */}
          <div className="contact-info-panel">
            <div className="info-card glass-card">
              <div className="info-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="info-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="info-details">
                <h4>Email Address</h4>
                <a href="mailto:sujal.patel@charusat.edu.in" className="info-link">
                  sujal.patel@charusat.edu.in
                </a>
              </div>
            </div>

            <div className="info-card glass-card">
              <div className="info-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="info-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <div className="info-details">
                <h4>Location</h4>
                <p className="info-text">CHARUSAT University, Changa, Gujarat, India</p>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="contact-form-panel glass-card">
            <div className="contact-form-heading">
              <h3>Send a Message</h3>

              {/* Toggle button drives the `showTip` useState variable */}
              <button
                type="button"
                className="tip-toggle-btn"
                onClick={() => setShowTip((prev) => !prev)}
                aria-label="Toggle help tip"
              >
                {showTip ? 'Hide tip' : 'Need a tip?'}
              </button>
            </div>

            {showTip && (
              <div className="help-tooltip">
                Tip: mention which project or section you're reaching out about so the reply is faster.
              </div>
            )}

            {showStatus && (
              <div className={`form-status-alert ${statusMessage.includes('successfully') ? 'success' : 'loading'}`}>
                {statusMessage}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="form-name">Name <span className="req">*</span></label>
                  <input
                    type="text"
                    id="form-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="form-email">Email <span className="req">*</span></label>
                  <input
                    type="email"
                    id="form-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email address"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="form-subject">Subject</label>
                <input
                  type="text"
                  id="form-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What is this about?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="form-message">Message <span className="req">*</span></label>
                <textarea
                  id="form-message"
                  name="message"
                  rows="5"
                  maxLength={MAX_MESSAGE_LENGTH}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your message here..."
                  required
                />
                {/* Live character count, derived from controlled state in real time */}
                <span className="char-count">
                  {formData.message.length} / {MAX_MESSAGE_LENGTH} characters
                </span>
              </div>

              <button type="submit" className="btn btn-submit">
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Contact;
