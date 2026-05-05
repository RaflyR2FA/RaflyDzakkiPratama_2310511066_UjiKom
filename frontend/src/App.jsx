import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ItemList from './pages/Item/ItemList';
import ItemForm from './pages/Item/ItemForm';
import ItemDetail from './pages/Item/ItemDetail';
import BorrowList from './pages/Borrow/BorrowList';
import BorrowForm from './pages/Borrow/BorrowForm';
import ReportPage from './pages/Report/ReportPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function HomeRedirect() {
  const { canApprove } = useAuth(); 
  
  return canApprove() ? <Navigate to="/dashboard" replace /> : <Navigate to="/items" replace />;
}

function DashboardGuard({ children }) {
  const { canApprove } = useAuth();
  return canApprove() ? children : <Navigate to="/items" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            
            {/* Terapkan HomeRedirect di rute utama (index) */}
            <Route index element={<HomeRedirect />} />
            
            {/* Bungkus Dashboard dengan DashboardGuard */}
            <Route path="dashboard" element={
              <DashboardGuard>
                <Dashboard />
              </DashboardGuard>
            } />
            
            {/* Items Routes */}
            <Route path="items" element={<ItemList />} />
            <Route path="items/add" element={<ItemForm />} />
            <Route path="items/:id" element={<ItemDetail />} />
            <Route path="items/:id/edit" element={<ItemForm />} />
            
            {/* Borrows Routes */}
            <Route path="borrows" element={<BorrowList />} />
            <Route path="borrows/request" element={<BorrowForm />} />
            
            {/* Reports Route */}
            <Route path="reports" element={<ReportPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}