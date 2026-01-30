import React, { useState } from 'react'

const RequestDiscount: React.FC = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    productService: '',
    originalPrice: '',
    requestedDiscount: '',
    discountType: 'percentage',
    reason: '',
    urgency: 'normal',
    attachments: null as FileList | null
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      attachments: e.target.files
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      alert('คำขอส่วนลดถูกส่งเรียบร้อยแล้ว')
      setIsSubmitting(false)
      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        productService: '',
        originalPrice: '',
        requestedDiscount: '',
        discountType: 'percentage',
        reason: '',
        urgency: 'normal',
        attachments: null
      })
    }, 2000)
  }

  const calculateDiscountedPrice = () => {
    const original = parseFloat(formData.originalPrice) || 0
    const discount = parseFloat(formData.requestedDiscount) || 0
    
    if (formData.discountType === 'percentage') {
      return original - (original * discount / 100)
    } else {
      return original - discount
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Request Discount
        </h1>
        <p className="text-gray-600">
          ส่งคำขอส่วนลดสำหรับลูกค้า
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">ข้อมูลคำขอ</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">ข้อมูลลูกค้า</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อลูกค้า *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="กรอกชื่อลูกค้า"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล *
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="08X-XXX-XXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Product/Service Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">ข้อมูลสินค้า/บริการ</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      สินค้า/บริการ *
                    </label>
                    <input
                      type="text"
                      name="productService"
                      value={formData.productService}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ระบุชื่อสินค้าหรือบริการ"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ราคาเต็ม (บาท) *
                      </label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ประเภทส่วนลด
                      </label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="percentage">เปอร์เซ็นต์ (%)</option>
                        <option value="fixed">จำนวนเงิน (บาท)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ส่วนลดที่ขอ *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="requestedDiscount"
                        value={formData.requestedDiscount}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                        max={formData.discountType === 'percentage' ? '100' : undefined}
                        className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={formData.discountType === 'percentage' ? '0' : '0.00'}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">
                          {formData.discountType === 'percentage' ? '%' : '฿'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">รายละเอียดคำขอ</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เหตุผลในการขอส่วนลด *
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="อธิบายเหตุผลที่ขอส่วนลด เช่น ลูกค้าประจำ, ซื้อจำนวนมาก, แข่งขันราคา เป็นต้น"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ความเร่งด่วน
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">ไม่เร่งด่วน</option>
                      <option value="normal">ปกติ</option>
                      <option value="high">เร่งด่วน</option>
                      <option value="urgent">เร่งด่วนมาก</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เอกสารแนบ
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      รองรับไฟล์: PDF, DOC, DOCX, JPG, PNG (สูงสุด 5 ไฟล์)
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">สรุปคำขอ</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ราคาเต็ม:</span>
                <span className="text-sm font-medium">
                  ฿{formData.originalPrice ? parseFloat(formData.originalPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ส่วนลด:</span>
                <span className="text-sm font-medium text-red-600">
                  {formData.requestedDiscount ? (
                    formData.discountType === 'percentage' 
                      ? `${formData.requestedDiscount}%`
                      : `฿${parseFloat(formData.requestedDiscount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`
                  ) : '-'}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">ราคาหลังหักส่วนลด:</span>
                  <span className="text-base font-bold text-green-600">
                    ฿{calculateDiscountedPrice().toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {formData.originalPrice && formData.requestedDiscount && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>ประหยัด:</strong> ฿
                    {(parseFloat(formData.originalPrice) - calculateDiscountedPrice()).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>

            {/* Status Indicators */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-900 mb-3">ความเร่งด่วน</h4>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  formData.urgency === 'urgent' ? 'bg-red-500' :
                  formData.urgency === 'high' ? 'bg-orange-500' :
                  formData.urgency === 'normal' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {formData.urgency === 'urgent' ? 'เร่งด่วนมาก' :
                   formData.urgency === 'high' ? 'เร่งด่วน' :
                   formData.urgency === 'normal' ? 'ปกติ' : 'ไม่เร่งด่วน'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestDiscount