// src/components/Logo.jsx
import { motion } from 'framer-motion';
import { RiDashboardFill } from 'react-icons/ri';

const Logo = ({ size = 'medium' }) => {
  const sizes = {
    small: { icon: 20, text: '1.2rem', gap: '0.5rem' },
    medium: { icon: 28, text: '1.8rem', gap: '0.8rem' },
    large: { icon: 40, text: '2.5rem', gap: '1rem' }
  };
  
  const { icon, text, gap } = sizes[size];

  return (
    <motion.div 
      className="logo-container"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <RiDashboardFill className="logo-icon" style={{ fontSize: icon }} />
      <span className="logo-text" style={{ fontSize: text, gap }}>
        <span className="logo-primary">Classy</span>
        <span className="logo-secondary">Cam</span>
      </span>
    </motion.div>
  );
};

export default Logo;