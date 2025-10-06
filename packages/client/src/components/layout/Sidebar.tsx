import React from 'react';
import { Link } from '@tanstack/react-router';

const Sidebar = () => {
  const menuItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '⚡', label: 'Patent Breaker', path: '/patent-breaker' },
    { icon: '🛡️', label: 'Patent Defender', path: '/patent-defender' },
    { icon: '⚖️', label: 'Infringement', path: '/infringement' },
    { icon: '🔄', label: 'Claims Enhancement', path: '/claims-enhancement' },
    { icon: '🔬', label: 'Pipeline Intelligence', path: '/pipeline' },
    { icon: '🧪', label: 'Drug Discovery', path: '/drug-discovery' },
    { icon: '📁', label: 'Patent Portfolios', path: '/portfolios' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      <div className="mb-8">
        <img src="/logo.svg" alt="Garden Logo" className="w-8 h-8" />
      </div>
      
      <nav className="flex flex-col gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
            activeProps={{
              className: "bg-green-50 text-green-700"
            }}
          >
            <span className="text-xl">{item.icon}</span>
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto">
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100">
          <span className="text-xl">👤</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 