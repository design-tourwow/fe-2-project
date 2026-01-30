import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SupplierCommission from './pages/SupplierCommission'
import DiscountSales from './pages/DiscountSales'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/supplier-commission" element={<SupplierCommission />} />
        <Route path="/discount-sales" element={<DiscountSales />} />
      </Routes>
    </Layout>
  )
}

export default App