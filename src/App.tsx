import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SupplierCommission from './pages/SupplierCommission'
import DiscountSales from './pages/DiscountSales'
import RequestDiscount from './pages/RequestDiscount'
import AuthToken from './pages/AuthToken'

function App() {
  return (
    <Routes>
      {/* Auth Token Route - ไม่ใช้ Layout */}
      <Route path="/authentoken" element={<AuthToken />} />
      
      {/* Main App Routes - ใช้ Layout */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/supplier-commission" element={<SupplierCommission />} />
            <Route path="/discount-sales" element={<DiscountSales />} />
            <Route path="/request-discount" element={<RequestDiscount />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  )
}

export default App