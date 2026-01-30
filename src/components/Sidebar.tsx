import React from 'react'

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-sidebar shadow-lg">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-blue-600">
        <div className="flex items-center">
          <div className="text-white text-xl font-bold">
            Dashboard
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {/* เมนูจะเพิ่มในอนาคต */}
          <div className="text-blue-100 text-sm px-4 py-2">
            เมนูจะเพิ่มในอนาคต
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Sidebar