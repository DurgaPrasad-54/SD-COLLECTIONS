import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed successfully!');
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-extrabold text-blue-500 mb-3">
              SD COLLECTIONS
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Your premium fashion destination. We bring style, comfort, and quality together.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="#" aria-label="Facebook" className="p-2 rounded-full bg-gray-800 hover:bg-blue-600 transition-colors">
                <FiFacebook size={16} />
              </a>
              <a href="#" aria-label="Instagram" className="p-2 rounded-full bg-gray-800 hover:bg-pink-600 transition-colors">
                <FiInstagram size={16} />
              </a>
              <a href="#" aria-label="Twitter" className="p-2 rounded-full bg-gray-800 hover:bg-sky-500 transition-colors">
                <FiTwitter size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Home'], ['/shop', 'Shop'], ['/about', 'About Us'], ['/contact', 'Contact'], ['/orders', 'My Orders']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-blue-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <FiMapPin className="mt-0.5 flex-shrink-0 text-blue-400" />
                <span>123 Fashion Street, Mumbai, India</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiPhone className="text-blue-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiMail className="text-blue-400" />
                <span>support@sdclothing.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-3">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-3">Subscribe to get the latest offers and updates.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="px-3 py-2 rounded-md bg-gray-800 text-gray-100 text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} SD COLLECTIONS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
