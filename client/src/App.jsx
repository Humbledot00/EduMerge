import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Institutions from './pages/master/Institutions';
import Campuses from './pages/master/Campuses';
import Departments from './pages/master/Departments';
import Programs from './pages/master/Programs';
import SeatMatrix from './pages/master/SeatMatrix';
import ApplicantList from './pages/applicants/ApplicantList';
import ApplicantForm from './pages/applicants/ApplicantForm';
import ApplicantDetail from './pages/applicants/ApplicantDetail';
import AdmissionList from './pages/admissions/AdmissionList';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />

        {/* Master Setup — Admin only */}
        <Route path="institutions" element={<PrivateRoute roles={['admin']}><Institutions /></PrivateRoute>} />
        <Route path="campuses"     element={<PrivateRoute roles={['admin']}><Campuses /></PrivateRoute>} />
        <Route path="departments"  element={<PrivateRoute roles={['admin']}><Departments /></PrivateRoute>} />
        <Route path="programs"     element={<PrivateRoute roles={['admin']}><Programs /></PrivateRoute>} />
        <Route path="seat-matrix"  element={<PrivateRoute roles={['admin']}><SeatMatrix /></PrivateRoute>} />

        {/* Applicants — Admin + Officer */}
        <Route path="applicants"         element={<PrivateRoute roles={['admin','admission_officer']}><ApplicantList /></PrivateRoute>} />
        <Route path="applicants/new"     element={<PrivateRoute roles={['admin','admission_officer']}><ApplicantForm /></PrivateRoute>} />
        <Route path="applicants/:id"     element={<PrivateRoute roles={['admin','admission_officer']}><ApplicantDetail /></PrivateRoute>} />
        <Route path="applicants/:id/edit" element={<PrivateRoute roles={['admin','admission_officer']}><ApplicantForm /></PrivateRoute>} />

        {/* Admissions — All roles */}
        <Route path="admissions" element={<AdmissionList />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
