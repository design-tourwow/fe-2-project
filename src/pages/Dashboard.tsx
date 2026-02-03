import React from 'react'

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="https://peoplesparty.or.th/wp-content/uploads/2024/09/PEOPLES-PARTY_DESIGN-CONCEPT-09-1.svg" 
            alt="Tourwow Logo" 
            className="h-32 w-auto mx-auto mb-6"
          />
        </div>
        
        {/* Welcome Message */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ยินดีต้อนรับเข้าสู่ระบบ
        </h1>
        <h2 className="text-3xl font-semibold text-blue-600">
          Tourwow Report
        </h2>
        
        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard