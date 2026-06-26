import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FiInfo } from 'react-icons/fi';

function ResetPassword() {
  return (
    <>
      <Helmet>
        <title>Reset Password – SD COLLECTIONS</title>
      </Helmet>
      <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700 text-center">
          
          <div className="mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <FiInfo size={24} />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Password-Less Security</h1>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            We've upgraded all accounts to password-less OTP authentication. There are no passwords to reset!
          </p>

          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
            Please use the one-time OTP login route to log into your account securely without a password.
          </p>

          <Link
            to="/login"
            className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
