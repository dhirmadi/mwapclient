import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-panel mt-auto border-t border-primary-500 border-opacity-20 backdrop-blur-md z-10">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-300">
              &copy; {currentYear} <span className="futuristic-text font-semibold">MWAP</span>. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-sm text-gray-300 hover:text-primary-400 transition-colors duration-300">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-gray-300 hover:text-primary-400 transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/contact" className="text-sm text-gray-300 hover:text-primary-400 transition-colors duration-300">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;