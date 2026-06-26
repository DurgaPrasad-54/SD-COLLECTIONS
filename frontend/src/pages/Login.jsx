import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { sendLoginOtp, verifyLoginOtp, resendOtp, resetOtpState } from '../store/authSlice';
import { FiMail, FiShield, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { loading, otpSent, otpPurpose } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
  const email = watch('email');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    // Reset OTP state when entering login page
    dispatch(resetOtpState());
  }, [dispatch]);

  useEffect(() => {
    let interval;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const onSendOtp = async (data) => {
    const result = await dispatch(sendLoginOtp({ email: data.email }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('OTP sent to your email!');
      setCooldown(60);
    }
  };

  const onVerifyOtp = async (data) => {
    const result = await dispatch(verifyLoginOtp({ email: data.email, otp: data.otp }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Welcome back!');
      navigate(state?.from?.pathname || '/');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    const result = await dispatch(resendOtp({ email, purpose: 'login' }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('A new OTP has been sent!');
      setCooldown(60);
    }
  };

  const inputClass = (err) =>
    `w-full pl-10 pr-3 py-2.5 border ${err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-sm bg-transparent outline-none focus:border-blue-500 dark:text-white`;

  return (
    <>
      <Helmet>
        <title>Login – SD COLLECTIONS</title>
        <meta name="description" content="Login to your SD COLLECTIONS account using OTP." />
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-500">SD COLLECTIONS</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
          </div>

          {!otpSent || otpPurpose !== 'login' ? (
            /* Step 1: Send OTP */
            <form onSubmit={handleSubmit(onSendOtp)} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/i, message: 'Invalid email' }
                    })}
                    type="email"
                    placeholder="you@example.com"
                    className={inputClass(errors.email)}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Sending OTP...' : 'Send Login OTP'}
              </button>
            </form>
          ) : (
            /* Step 2: Verify OTP */
            <form onSubmit={handleSubmit(onVerifyOtp)} className="space-y-5">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300 flex items-center space-x-2">
                <FiMail size={16} className="flex-shrink-0" />
                <span>OTP sent to <strong className="font-semibold">{email}</strong></span>
              </div>

              {/* Hidden Email Field to submit with OTP */}
              <input type="hidden" value={email} {...register('email')} />

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Enter 6-Digit OTP</label>
                <div className="relative">
                  <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    {...register('otp', {
                      required: 'OTP is required',
                      pattern: { value: /^\d{6}$/, message: 'OTP must be 6 digits' }
                    })}
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className={inputClass(errors.otp)}
                  />
                </div>
                {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>

              <div className="flex items-center justify-between text-xs mt-2">
                <button
                  type="button"
                  onClick={() => dispatch(resetOtpState())}
                  className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                >
                  <FiArrowLeft size={12} />
                  <span>Change Email</span>
                </button>
                <button
                  type="button"
                  disabled={cooldown > 0}
                  onClick={handleResend}
                  className="text-blue-600 font-medium hover:underline disabled:text-gray-400"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          <div className="border-t border-gray-150 dark:border-gray-700 my-6"></div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">Create one</Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-4">
            Are you an Admin?{' '}
            <Link to="/admin/login" className="text-purple-600 font-medium hover:underline">Admin Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
