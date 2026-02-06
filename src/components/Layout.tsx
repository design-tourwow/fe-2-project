import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  const sidebarMenuItems = [
    {
      name: 'Report Gap',
      path: 'https://finance-backoffice-report.vercel.app/tour-image-manager',
      isExternal: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-48">
          <div className="flex flex-col flex-grow bg-white shadow-lg border-r border-gray-200">
            {/* Logo/Brand */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-center w-full">
                <img 
                  src="https://financebackoffice.tourwow.com/assets/images/tourwow-logo.png" 
                  alt="Tourwow Logo" 
                  className="h-8 w-auto max-w-full"
                />
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="mt-4 flex-1">
              <div className="px-3 space-y-1">
                {sidebarMenuItems.map((item) => {
                  const isActive = location.pathname === item.path
                  
                  if (item.isExternal) {
                    return (
                      <a
                        key={item.path}
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                        <svg className="w-3 h-3 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )
                  }
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar with Navigation */}
        <TopBar onMenuClick={handleMenuClick} />
        
        {/* Mobile Sidebar (only for mobile) */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout