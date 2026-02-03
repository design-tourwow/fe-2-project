import React, { useState } from 'react';
import { ExtendedFilterParams } from '../types/filterTypes';
import { supplierApiService } from '../services/supplierApi';
import { discountSalesApiService } from '../services/discountSalesApi';
import { orderDiscountApiService } from '../services/orderDiscountApi';

const ApiTester: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Test parameters with quarterly mode
  const testParams: ExtendedFilterParams = {
    year: 2024,
    quarter: 1,
    job_position: "crm",
    team_number: 1,
    user_id: 615
  };

  const testSupplierAPI = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing Supplier API with params:', testParams);
      const data = await supplierApiService.getSupplierReport(testParams);
      setResults({ 
        type: 'Supplier Performance', 
        data, 
        count: data.length,
        params: testParams 
      });
      console.log('✅ Supplier API Results:', data);
    } catch (error) {
      console.error('❌ Supplier API Error:', error);
      setResults({ 
        type: 'Supplier Performance', 
        error: error instanceof Error ? error.message : 'Unknown error', 
        params: testParams 
      });
    } finally {
      setLoading(false);
    }
  };

  const testSalesDiscountAPI = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing Sales Discount API with params:', testParams);
      const data = await discountSalesApiService.getDiscountSalesReport(testParams);
      setResults({ 
        type: 'Sales Discount Analysis', 
        data, 
        count: data.length,
        params: testParams 
      });
      console.log('✅ Sales Discount API Results:', data);
    } catch (error) {
      console.error('❌ Sales Discount API Error:', error);
      setResults({ 
        type: 'Sales Discount Analysis', 
        error: error instanceof Error ? error.message : 'Unknown error', 
        params: testParams 
      });
    } finally {
      setLoading(false);
    }
  };

  const testOrderDiscountAPI = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing Order Discount API with params:', testParams);
      const data = await orderDiscountApiService.getOrderDiscountReport(testParams);
      setResults({ 
        type: 'Order Discount Analysis', 
        data, 
        count: data.length,
        params: testParams 
      });
      console.log('✅ Order Discount API Results:', data);
    } catch (error) {
      console.error('❌ Order Discount API Error:', error);
      setResults({ 
        type: 'Order Discount Analysis', 
        error: error instanceof Error ? error.message : 'Unknown error', 
        params: testParams 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-blue-900 mb-2">🧪 API Parameters Testing</h2>
        <p className="text-blue-700 text-sm mb-4">
          ทดสอบ API Services ทั้ง 3 ตัวด้วย Parameters ใหม่
        </p>
        
        {/* Test Parameters Display */}
        <div className="bg-white p-3 rounded border">
          <h3 className="font-medium text-gray-700 mb-2">📋 Test Parameters (Quarterly Mode):</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            <div className="bg-gray-100 px-2 py-1 rounded">
              <span className="text-gray-600">Year:</span>
              <span className="font-medium ml-1">{testParams.year}</span>
            </div>
            <div className="bg-gray-100 px-2 py-1 rounded">
              <span className="text-gray-600">Quarter:</span>
              <span className="font-medium ml-1">{testParams.quarter}</span>
            </div>
            <div className="bg-green-100 px-2 py-1 rounded">
              <span className="text-green-600">Job Position:</span>
              <span className="font-medium ml-1">{testParams.job_position}</span>
            </div>
            <div className="bg-green-100 px-2 py-1 rounded">
              <span className="text-green-600">Team:</span>
              <span className="font-medium ml-1">{testParams.team_number}</span>
            </div>
            <div className="bg-green-100 px-2 py-1 rounded">
              <span className="text-green-600">User ID:</span>
              <span className="font-medium ml-1">{testParams.user_id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={testSupplierAPI}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          {loading ? '⏳ Testing...' : '📈 Test Supplier Performance'}
        </button>

        <button
          onClick={testSalesDiscountAPI}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          {loading ? '⏳ Testing...' : '💰 Test Sales Discount'}
        </button>

        <button
          onClick={testOrderDiscountAPI}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          {loading ? '⏳ Testing...' : '🛒 Test Order Discount'}
        </button>
      </div>

      {/* Results Display */}
      {results && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 {results.type} Results
          </h3>
          
          {/* API URL Display */}
          <div className="mb-4 p-3 bg-white rounded border">
            <h4 className="font-medium text-gray-700 mb-2">🔗 API Call Details:</h4>
            <div className="text-sm font-mono bg-gray-100 p-2 rounded">
              {results.type === 'Supplier Performance' && 
                `GET /api/reports/supplier-performance?year=${results.params.year}&quarter=${results.params.quarter}&job_position=${results.params.job_position}&team_number=${results.params.team_number}&user_id=${results.params.user_id}`
              }
              {results.type === 'Sales Discount Analysis' && 
                `GET /api/reports/sales-discount?year=${results.params.year}&quarter=${results.params.quarter}&job_position=${results.params.job_position}&team_number=${results.params.team_number}&user_id=${results.params.user_id}`
              }
              {results.type === 'Order Discount Analysis' && 
                `GET /api/reports/order-has-discount?year=${results.params.year}&quarter=${results.params.quarter}&job_position=${results.params.job_position}&team_number=${results.params.team_number}&user_id=${results.params.user_id}`
              }
            </div>
          </div>

          {/* Results or Error */}
          {results.error ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <h4 className="font-medium text-red-800 mb-2">❌ Error:</h4>
              <p className="text-red-700">{results.error}</p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-700 mb-2">
                ✅ Success - {results.count} records returned
              </h4>
              <div className="max-h-96 overflow-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(results.data.slice(0, 2), null, 2)}
                  {results.count > 2 && `\n\n... และอีก ${results.count - 2} records`}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* API Documentation */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">📚 New Parameters Documentation</h3>
        <div className="text-sm text-yellow-800 space-y-2">
          <div><strong>New Parameters Added:</strong></div>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><code>job_position</code> (string) - ตำแหน่งงาน เช่น "crm", "ts", "Customer Service"</li>
            <li><code>team_number</code> (integer) - หมายเลขทีม เช่น 1, 2, 3</li>
            <li><code>user_id</code> (integer) - ID ของ User เช่น 615, 620, 557</li>
          </ul>
          
          <div className="mt-3"><strong>Usage Examples (Quarterly Mode):</strong></div>
          <ul className="list-disc list-inside ml-4 space-y-1 font-mono text-xs">
            <li>?year=2024&quarter=1</li>
            <li>?job_position=crm</li>
            <li>?team_number=1</li>
            <li>?user_id=615</li>
            <li>?year=2024&quarter=1&job_position=crm&team_number=1&user_id=615</li>
          </ul>

          <div className="mt-3"><strong>Rules:</strong></div>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>ทุก parameter เป็น optional</li>
            <li>job_position ไม่สนใจ case sensitive</li>
            <li>Default เป็น quarterly mode</li>
            <li>เมื่อเลือก "ทั้งหมด" จะไม่ส่ง year parameter</li>
            <li>ใช้ร่วมกับ parameters เดิมได้</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiTester;