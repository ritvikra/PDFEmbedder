import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import gardenLogo from '../../assets/garden-black-text-logo.png';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img src={gardenLogo} alt="Garden Logo" className="h-8" />
              <div className="flex gap-6">
                <Link
                  to="/"
                  className="font-medium text-gray-700 hover:text-green-700"
                >
                  Jobs
                </Link>
                <Link
                  to="/document-groups"
                  className="font-medium text-gray-700 hover:text-green-700"
                >
                  Document Groups
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 