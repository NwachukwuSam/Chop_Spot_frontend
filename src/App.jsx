import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CustomerDashboard from './dashboards/CustomerDashboard';
import VendorRegister from './auth/VendoRegister';
import VendorDashboard from './dashboards/VendorDashboard';
import RiderRegister from './auth/RiderRegister';
import RiderDashboard from './dashboards/RiderDashboard';

function App() {
  
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard/>} />
          <Route path="/vendor-registration" element={<VendorRegister/>} />
          <Route path="/vendor-dashboard" element={<VendorDashboard/>} />
          <Route path="/rider-registration" element={<RiderRegister/>} />
          <Route path="/rider-dashboard" element={<RiderDashboard/>} />
        </Routes>
    </BrowserRouter>
  )
}

export default App
