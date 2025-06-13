// src/pages/Onboarding.jsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaChalkboardTeacher, 
  FaVideo, 
  FaUserShield, 
  FaChartLine,
  FaArrowRight
} from 'react-icons/fa';
import { RiDashboardFill } from 'react-icons/ri';
// src/pages/Onboarding.jsx
// ... existing imports ...
import Logo from '../components/Logo';


  return (
    <motion.div className="onboarding-container">
      <header className="onboarding-header">
        <Logo size="large" />
        <p className="app-tagline">Intelligent Classroom Surveillance System</p>
      </header>
      {/* ... rest of onboarding page ... */}
    </motion.div>
  );

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="onboarding-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Floating decorative elements */}
      <div className="floating-element circle-pink"></div>
      <div className="floating-element circle-blue"></div>
      <div className="floating-element square-white"></div>
      <div className="floating-element triangle-black"></div>
      
      {/* Header with beautiful logo */}
      <header className="onboarding-header">
        <div className="logo-container">
          <div className="app-logo">
            <RiDashboardFill className="logo-icon" />
            <div className="logo-text">
              <span className="logo-primary">Classy</span>
              <span className="logo-secondary">Cam</span>
            </div>
          </div>
        </div>
        <p className="app-tagline">Intelligent Classroom Surveillance System</p>
      </header>

      <main className="onboarding-main">
        <section className="hero-section">
          <div className="hero-content">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Transform Your <span className="highlight">Classroom</span> Monitoring
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Advanced AI-powered surveillance for better student engagement, 
              behavior analysis, and classroom management.
            </motion.p>
            <motion.div 
              className="cta-buttons"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <button 
                className="primary-btn"
                onClick={() => navigate('/signup')}
              >
                Get Started
                <FaArrowRight className="btn-icon" />
              </button>
              <button 
                className="secondary-btn"
                onClick={() => navigate('/login')}
              >
                Login to Dashboard
              </button>
            </motion.div>
          </div>
          <motion.div 
            className="hero-image"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="dashboard-preview">
              <div className="screen-header">
                <div className="screen-logo">
                  <RiDashboardFill className="logo-icon" />
                  <span>ClassyCam</span>
                </div>
              </div>
              <div className="screen-content">
                <div className="preview-card live-feed">
                  <div className="preview-indicator live">LIVE</div>
                </div>
                <div className="preview-card analytics">
                  <div className="preview-chart">
                    <div className="chart-bar" style={{ height: '70%' }}></div>
                    <div className="chart-bar" style={{ height: '90%' }}></div>
                    <div className="chart-bar" style={{ height: '60%' }}></div>
                  </div>
                </div>
                <div className="preview-card alerts">
                  <div className="alert-preview"></div>
                  <div className="alert-preview"></div>
                </div>
                <div className="preview-card recordings">
                  <div className="recording-thumb"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="features-section">
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            Why Choose ClassyCam?
          </motion.h3>
          <div className="features-grid">
            {[
              {
                icon: <FaVideo />,
                title: "Live Video Streaming",
                desc: "Real-time classroom monitoring from anywhere with crystal clear video quality",
                color: "#FF4D6D"
              },
              {
                icon: <FaChalkboardTeacher />,
                title: "Behavior Detection",
                desc: "AI-powered analysis of student engagement and attention levels",
                color: "#4D8BFF"
              },
              {
                icon: <FaUserShield />,
                title: "Automated Alerts",
                desc: "Instant notifications for unusual activities and important events",
                color: "#4ADE80"
              },
              {
                icon: <FaChartLine />,
                title: "Analytics Dashboard",
                desc: "Comprehensive reports on classroom dynamics and student performance",
                color: "#FBBF24"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + (index * 0.1) }}
                whileHover={{ y: -10 }}
                style={{ borderTop: `4px solid ${feature.color}` }}
              >
                <div className="feature-icon" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
        
        <section className="testimonial-section">
          <motion.div 
            className="testimonial-card"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <div className="quote">"</div>
            <p className="testimonial-text">
              ClassyCam has transformed how I monitor my classroom. The behavior detection 
              features help me understand student engagement in ways I never thought possible.
            </p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>Sarah Johnson</h4>
                <p>High School Teacher</p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <motion.footer 
        className="onboarding-footer"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.6 }}
      >
        <p>© {new Date().getFullYear()} ClassyCam. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default Onboarding;