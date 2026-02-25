// src/pages/DashboardSelection.jsx

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../../components/header';
// Inside your component's return:

export default function DashboardSelection() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('User');  // Default fallback

  useEffect(() => {
    // Fetch username from localStorage (assuming it's set after login, e.g., localStorage.setItem('username', 'Manoranjith'))
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);  // Empty dependency array: Runs once on mount

  const options = [
    {
      title: 'Doctor',
      description: 'Access patient records, coding review & clinical documentation',
      icon: <span className="text-5xl">🩺</span>,
      color: 'from-blue-500 to-cyan-500',
      route: '/doctor-dashboard',
      disabled: false,
    },
    {
      title: 'Validator',
      description: 'Review claims, validate codes, check compliance & rules',
      icon: <span className="text-5xl">🛡️</span>,
      color: 'from-purple-500 to-indigo-600',
      route: '/validator-dashboard',
      disabled: false,
    },
    {
      title: 'Admin',
      description: 'Manage users, roles, settings, audit logs & system configuration',
      icon: <span className="text-5xl">💼</span>,
      color: 'from-amber-500 to-orange-600',
      route: '/admin-dashboard',
      disabled: false,
    },
    {
      title: 'OP',
      description: 'Manage operations, workflows, and related tasks',
      icon: <span className="text-5xl">⚙️</span>,
      color: 'from-green-500 to-emerald-600',
      route: '/op-dashboard',
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header companyName="RiteTech Technologies" logoInitials="RT" />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Choose Your Role
            </h2>
            <p className="text-lg text-gray-600">
              Select the dashboard that matches your work area
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {options.map((option) => (
              <button
                key={option.title}
                onClick={() => !option.disabled && navigate(option.route)}
                disabled={option.disabled}
                className={`
                  group relative overflow-hidden rounded-2xl p-8 text-left
                  bg-gradient-to-br ${option.color} text-white
                  shadow-xl transition-all duration-300
                  ${option.disabled ? 'opacity-50 cursor-not-allowed pointer-events-auto hover:shadow-xl hover:-translate-y-0 hover:scale-100' : 'hover:shadow-2xl transform hover:-translate-y-2 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500'}
                `}
              >
                {/* Background shine effect (disabled for inactive buttons) */}
                {!option.disabled && (
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}

                <div className="relative z-10">
                  <div className="mb-6 opacity-90 transition-opacity">
                    {option.icon}
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{option.title}</h3>
                  <p className="text-white/90 text-base leading-relaxed">
                    {option.description}
                  </p>

                  <div className="mt-8 flex items-center text-white/80">
                    <span className="font-medium">Enter Dashboard</span>
                    <svg
                      className="ml-2 w-5 h-5 transform transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Optional footer */}
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} RiteTech AI • All rights reserved
      </footer>
    </div>
  );
}