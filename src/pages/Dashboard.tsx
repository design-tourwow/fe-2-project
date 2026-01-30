import React from 'react'

const Dashboard: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ยินดีต้อนรับเข้าสู่ระบบ Tourwow Report
        </h1>
        <p className="text-lg text-gray-600">
          กรุณาเลือกเมนูด้านซ้ายเพื่อเข้าดู Report
        </p>
      </div>
    </div>
  )
}

export default Dashboard