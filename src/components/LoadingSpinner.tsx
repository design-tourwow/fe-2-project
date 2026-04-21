import React from 'react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "กำลังนำท่านไปสู่การเปลี่ยนแปลง", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24', 
    lg: 'h-32 w-32'
  }

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Spinning Circle */}
        <div className="mb-6">
          <div className={`${sizeClasses[size]} mx-auto border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`} />
        </div>
        
        {/* Loading Message */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 mb-2">
            {message}
          </p>
          
          {/* Loading Dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner