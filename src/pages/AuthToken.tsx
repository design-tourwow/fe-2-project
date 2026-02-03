import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const AuthToken: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      // เก็บ JWT Token ใน localStorage
      localStorage.setItem('jwt_token', token)
      console.log('JWT Token saved successfully')
      
      // Redirect ไปหน้า Dashboard
      navigate('/', { replace: true })
    } else {
      // ถ้าไม่มี token ให้ redirect ไปหน้า Dashboard เลย
      console.warn('No token provided, redirecting to dashboard')
      navigate('/', { replace: true })
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {/* Loading Animation */}
        <div className="mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        
        {/* Loading Message */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          กำลังตรวจสอบสิทธิ์...
        </h1>
        <p className="text-gray-600">
          กรุณารอสักครู่
        </p>
      </div>
    </div>
  )
}

export default AuthToken