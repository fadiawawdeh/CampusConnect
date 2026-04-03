import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2>{user?.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}</h2>
      <p>Welcome {user?.firstName} {user?.lastName}</p>
      <p>Your role is: <strong>{user?.role}</strong></p>
      <p>This page proves the role-based login story is implemented.</p>
    </div>
  );
}
