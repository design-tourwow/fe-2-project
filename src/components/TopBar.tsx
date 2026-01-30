import React from 'react'

const TopBar: React.FC = () => {
  return (
    <header className="bg-topbar shadow-sm border-b border-orange-600">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Page Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-white">
            Dashboard
          </h1>
        </div>

        {/* User Info / Actions */}
        <div className="flex items-center space-x-4">
          <div className="text-white text-sm">
            ยินดีต้อนรับ
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar