import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { sendRegisterOtp, verifyRegisterOtp, resendOtp, resetOtpState } from '../store/authSlice';
import { FiMail, FiUser, FiPhone, FiShield, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, otpSent, otpPurpose } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
  const name = watch('name');
  const email = watch('email');
  const phone = watch('phone');
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
    const result = await dispatch(sendRegisterOtp({ name: data.name, email: data.email, phone: data.phone }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('OTP sent to your email!');
      setCooldown(60);
    }
  };

  const onVerifyOtp = async (data) => {
    const result = await dispatch(verifyRegisterOtp({
      name: data.name,
      email: data.email,
      phone: data.phone,
      otp: data.otp
    }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Registration successful! Welcome to SD COLLECTIONS!');
      navigate('/');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    const result = await dispatch(resendOtp({ email, purpose: 'register' }));
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
        <title>Register – SD COLLECTIONS</title>
        <meta name="description" content="Register for an SD COLLECTIONS account using email verification." />
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Join SD COLLECTIONS today</p>
          </div>

          {!otpSent || otpPurpose !== 'register' ? (
            /* Step 1: Account Details */
            <form onSubmit={handleSubmit(onSendOtp)} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    placeholder="John Doe"
                    className={inputClass(errors.name)}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

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

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Phone Number (10-Digit Indian)</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    {...register('phone', {
                      required: 'Phone is required',
                      pattern: { value: /^[6-9]\d{9}$/, message: 'Please provide a valid 10-digit Indian number' }
                    })}
                    type="tel"
                    placeholder="9876543210"
                    className={inputClass(errors.phone)}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              </button>
            </form>
          ) : (
            /* Step 2: Verification */
            <form onSubmit={handleSubmit(onVerifyOtp)} className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300 flex flex-col space-y-1">
                <span>We've sent an OTP to <strong className="font-semibold">{email}</strong></span>
                <span>Name: <strong className="font-semibold">{name}</strong></span>
                <span>Phone: <strong className="font-semibold">{phone}</strong></span>
              </div>

              {/* Hidden fields to submit with OTP */}
              <input type="hidden" value={name} {...register('name')} />
              <input type="hidden" value={email} {...register('email')} />
              <input type="hidden" value={phone} {...register('phone')} />

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
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <div className="flex items-center justify-between text-xs mt-2">
                <button
                  type="button"
                  onClick={() => dispatch(resetOtpState())}
                  className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                >
                  <FiArrowLeft size={12} />
                  <span>Back to Details</span>
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
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;
