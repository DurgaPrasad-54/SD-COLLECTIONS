import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { sendAdminOtp, verifyAdminOtp, resendOtp, resetOtpState } from '../../store/authSlice';
import { FiMail, FiShield, FiArrowLeft, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, otpSent, otpPurpose } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
  const email = watch('email');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
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
    const result = await dispatch(sendAdminOtp({ email: data.email }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Admin OTP sent successfully!');
      setCooldown(60);
    }
  };

  const onVerifyOtp = async (data) => {
    const result = await dispatch(verifyAdminOtp({ email: data.email, otp: data.otp }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Access granted! Welcome to the Admin Portal.');
      navigate('/admin/dashboard');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    const result = await dispatch(resendOtp({ email, purpose: 'admin-login' }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('A new Admin OTP has been sent!');
      setCooldown(60);
    }
  };

  const inputClass = (err) =>
    `w-full pl-10 pr-3 py-2.5 border ${err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-sm bg-transparent outline-none focus:border-purple-500 dark:text-white`;

  return (
    <>
      <Helmet>
        <title>Admin Login – SD COLLECTIONS Portal</title>
        <meta name="description" content="Secure administrator gateway for SD COLLECTIONS." />
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-150 dark:border-gray-700">
          
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-3">
              <FiLock size={22} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Control Center</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Secure Portal Login</p>
          </div>

          {!otpSent || otpPurpose !== 'admin-login' ? (
            /* Step 1: Send Admin OTP */
            <form onSubmit={handleSubmit(onSendOtp)} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Admin Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    {...register('email', {
                      required: 'Admin email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/i, message: 'Invalid email address' }
                    })}
                    type="email"
                    placeholder="admin@sdclothing.com"
                    className={inputClass(errors.email)}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Requesting Access...' : 'Verify Admin Credentials'}
              </button>
            </form>
          ) : (
            /* Step 2: Verify Admin OTP */
            <form onSubmit={handleSubmit(onVerifyOtp)} className="space-y-5">
              <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-150 dark:border-purple-900 rounded-lg p-3 text-xs text-purple-700 dark:text-purple-300 flex items-center space-x-2">
                <FiMail size={16} className="flex-shrink-0" />
                <span>Admin token sent to <strong className="font-semibold">{email}</strong></span>
              </div>

              {/* Hidden Email Field to submit with OTP */}
              <input type="hidden" value={email} {...register('email')} />

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Enter Admin Code</label>
                <div className="relative">
                  <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    {...register('otp', {
                      required: 'Verification code is required',
                      pattern: { value: /^\d{6}$/, message: 'Verification code must be 6 digits' }
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
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Authorizing...' : 'Authorize Login'}
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
                  className="text-purple-600 font-semibold hover:underline disabled:text-gray-400"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          <div className="border-t border-gray-150 dark:border-gray-700 my-6"></div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Not an administrator?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">User Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default AdminLogin;
