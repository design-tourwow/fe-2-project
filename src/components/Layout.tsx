import React, { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
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
  )
}

export default Layout