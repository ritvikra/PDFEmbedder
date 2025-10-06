import React from 'react';
import { Link } from '@tanstack/react-router';

interface PlatformCard {
  title: string;
  description: string;
  icon: string;
  path: string;
}

const platformCards: PlatformCard[] = [
  {
    title: 'Patent Breaker',
    description: 'Discover relevant prior art and automatically generate an invalidity chart in minutes.',
    icon: '⚡',
    path: '/patent-breaker'
  },
  {
    title: 'Patent Defender',
    description: 'Anticipate invalidity arguments and generate potential invalidity charts in minutes.',
    icon: '🛡️',
    path: '/patent-defender'
  },
  {
    title: 'Infringement',
    description: 'Generate contentions by finding infringing content on a competitor website instantly.',
    icon: '⚖️',
    path: '/infringement'
  },
  {
    title: 'Claims Enhancement',
    description: 'Upgrade your claims with infringing content from a competitor\'s product in minutes.',
    icon: '🔄',
    path: '/claims-enhancement'
  },
  {
    title: 'Pipeline Intelligence',
    description: 'Understand the drug research pipelines of leading pharma companies instantaneously.',
    icon: '🔬',
    path: '/pipeline'
  },
  {
    title: 'Drug Discovery',
    description: 'Upload a chemical structure (SMILES or image) and get a comprehensive patent landscape in seconds.',
    icon: '🧪',
    path: '/drug-discovery'
  }
];

const HomePage = () => {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-8">Welcome to Garden</h1>
      
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-gray-900">Platform</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platformCards.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl">
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {card.description}
                  </p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="text-xl font-medium text-gray-900 mt-12">Management</h2>
        <Link
          to="/portfolios"
          className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl">
              📁
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Patent Portfolios
              </h3>
              <p className="text-gray-500 text-sm">
                Manage your patent portfolios and perform bulk analysis across your patents in minutes.
              </p>
            </div>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HomePage; 