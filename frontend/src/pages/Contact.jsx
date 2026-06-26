import React from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { FiMapPin, FiMail, FiPhone, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/contact', data);
      toast.success('Message sent! We\'ll get back to you soon.');
      reset();
    } catch (_) { /* error toast handled globally */ }
  };

  const inputClass = (err) =>
    `w-full px-4 py-2.5 border ${err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-sm bg-transparent outline-none focus:border-blue-500`;

  return (
    <>
      <Helmet>
        <title>Contact Us – SD COLLECTIONS</title>
        <meta name="description" content="Get in touch with SD COLLECTIONS support team." />
      </Helmet>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">Contact Us</h1>
          <p className="text-gray-500 dark:text-gray-400">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              { icon: FiMapPin, title: 'Address', text: '123 Fashion Street, Bandra West, Mumbai – 400050' },
              { icon: FiPhone, title: 'Phone', text: '+91 98765 43210' },
              { icon: FiMail, title: 'Email', text: 'support@sdclothing.com' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{text}</p>
                </div>
              </div>
            ))}
            <div className="mt-6 rounded-xl overflow-hidden h-52 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
              <p className="text-sm">Map Placeholder</p>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-2xl p-7 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Name *</label>
              <input {...register('name', { required: 'Name is required' })} placeholder="Your name" className={inputClass(errors.name)} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Email *</label>
              <input {...register('email', { required: 'Email is required' })} type="email" placeholder="your@email.com" className={inputClass(errors.email)} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Subject</label>
              <input {...register('subject')} placeholder="How can we help?" className={inputClass(false)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Message *</label>
              <textarea {...register('message', { required: 'Message is required' })} rows={4} placeholder="Your message..."
                className={`${inputClass(errors.message)} resize-none`} />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              <FiSend size={16} /><span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Contact;
