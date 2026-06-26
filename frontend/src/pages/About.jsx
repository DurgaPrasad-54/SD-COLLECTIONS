import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FiTarget, FiHeart, FiUsers, FiPackage } from 'react-icons/fi';

const STATS = [
  { label: 'Products', value: '5000+' },
  { label: 'Customers', value: '50,000+' },
  { label: 'Cities', value: '100+' },
  { label: 'Years', value: '5+' },
];

const VALUES = [
  { icon: FiTarget, title: 'Our Mission', desc: 'To make premium fashion accessible to everyone across India.' },
  { icon: FiHeart, title: 'Our Values', desc: 'Quality, sustainability, and customer satisfaction are at the heart of everything we do.' },
  { icon: FiUsers, title: 'Our Team', desc: 'A passionate team of fashion enthusiasts dedicated to bringing you the best styles.' },
  { icon: FiPackage, title: 'Our Products', desc: 'Curated collections from top brands and independent designers.' },
];

function About() {
  return (
    <>
      <Helmet>
        <title>About Us – SD COLLECTIONS</title>
        <meta name="description" content="Learn about SD COLLECTIONS, our mission, values, and team." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 -mx-4 -mt-6 px-6 py-16 text-white text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">About SD COLLECTIONS</h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
          We are passionate about fashion and committed to bringing you the finest clothing experiences since 2019.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
        {STATS.map(({ label, value }) => (
          <div key={label} className="text-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-3xl font-extrabold text-blue-600">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </section>

      {/* Story */}
      <section className="mb-14 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Our Story</h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          SD COLLECTIONS was founded in 2019 with a simple vision — to make premium fashion accessible for everyone.
          What started as a small boutique in Mumbai has grown into one of India's fastest-growing online fashion platforms.
          We believe that great style should never compromise on comfort or quality, and that's exactly what we deliver — day in, day out.
        </p>
      </section>

      {/* Values */}
      <section className="mb-14">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">What Drives Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start space-x-4 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 flex-shrink-0">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to Explore?</h2>
        <p className="text-blue-100 mb-6">Shop the latest collections handpicked just for you.</p>
        <a href="/shop" className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">
          Shop Now
        </a>
      </section>
    </>
  );
}

export default About;
