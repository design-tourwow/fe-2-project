import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SupplierCommission from './pages/SupplierCommission'
import DiscountSales from './pages/DiscountSales'
import RequestDiscount from './pages/RequestDiscount'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/supplier-commission" element={<SupplierCommission />} />
        <Route path="/discount-sales" element={<DiscountSales />} />
        <Route path="/request-discount" element={<RequestDiscount />} />
      </Routes>
    </Layout>
  )
}

export default App