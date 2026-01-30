import React from 'react'

interface TopBarProps {
  onMenuClick: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-topbar shadow-sm border-b border-orange-600">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile Menu Button + Page Title */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-white hover:text-gray-300 mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-white">
            Tourwow Report System
          </h1>
        </div>

        {/* User Info / Actions */}
        <div className="flex items-center space-x-4">
          <div className="text-white text-sm hidden sm:block">
            ยินดีต้อนรับ
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar