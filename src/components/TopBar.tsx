import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface TopBarProps {
  onMenuClick: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const location = useLocation()

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
        </svg>
      )
    },
    {
      name: 'Supplier Commission',
      path: '/supplier-commission',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      name: 'Discount Sales',
      path: '/discount-sales',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      name: 'Order Discount',
      path: '/request-discount',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ]

  return (
    <header className="shadow-sm">
      <div className="flex">
        {/* Logo Section - White Background */}
        <div className="bg-white px-6 py-4 flex items-center">
          <img 
            src="https://financebackoffice.tourwow.com/assets/images/tourwow-logo.png" 
            alt="Tourwow Logo" 
            className="h-8 w-auto"
          />
        </div>

        {/* Navigation Section - Blue Background */}
        <div className="flex-1 flex items-center justify-between px-6 py-4" style={{ backgroundColor: '#0b69a3' }}>
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-800 text-white' 
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }
                  `}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Button + User Info */}
          <div className="flex items-center space-x-4 lg:ml-auto">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden text-white hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* User Info */}
            <div className="text-white text-sm hidden sm:block">
              ยินดีต้อนรับ
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div className="lg:hidden" style={{ backgroundColor: '#0b69a3' }}>
        <nav className="px-6 py-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-800 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }
                `}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default TopBar