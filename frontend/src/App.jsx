import { useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import BrowseVenues from "./components/BrowseVenues.jsx";
import CreateReservation from "./components/CreateReservation.jsx";
import UserBookings from "./components/UserBookings.jsx";
import AdminAddVenue from "./components/AdminAddVenue.jsx";

const API_BASE_URL = "http://localhost:5000";

const getStoredUser = () => {
  try {
    const value = localStorage.getItem("user");
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

function ProtectedRoute() {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/app/venues" replace /> : <Outlet />;
}

function RegisterPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    birthCountry: "",
    birthCity: "",
    gender: "male",
    address: "",
    phoneNumber: "",
    universityEmail: "",
    role: "student",
    password: "",
    confirmPassword: "",
  });

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("Registering...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed.");
      setMessage("Registration successful. You can login now.");
      navigate("/login");
    } catch (error) {
      setMessage(error.message || "Registration failed.");
    }
  };

  return (
    <div>
      <h1>CampusConnect</h1>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={onChange} required />
        <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={onChange} required />
        <input name="birthDate" type="date" value={form.birthDate} onChange={onChange} required />
        <input name="birthCountry" placeholder="Birth Country" value={form.birthCountry} onChange={onChange} required />
        <input name="birthCity" placeholder="Birth City" value={form.birthCity} onChange={onChange} required />
        <select name="gender" value={form.gender} onChange={onChange}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input name="address" placeholder="Address (optional)" value={form.address} onChange={onChange} />
        <input name="phoneNumber" placeholder="Phone (optional)" value={form.phoneNumber} onChange={onChange} />
        <input name="universityEmail" type="email" placeholder="University Email" value={form.universityEmail} onChange={onChange} required />
        <select name="role" value={form.role} onChange={onChange}>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="club_organizer">Club Organizer</option>
        </select>
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={onChange} required />
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("Logging in...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed.");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Login successful.");
      navigate("/app/venues");
    } catch (error) {
      setMessage(error.message || "Login failed.");
    }
  };

  return (
    <div>
      <h1>CampusConnect</h1>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
      <p>No account yet? <Link to="/register">Register</Link></p>
    </div>
  );
}

function AppLayout() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <h1>CampusConnect</h1>
      <p>
        Logged in as <strong>{user?.firstName} {user?.lastName}</strong> ({user?.role})
      </p>
      <nav style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "16px" }}>
        <Link to="/app/venues">Browse Venues</Link>
        <Link to="/app/reservations/new">Create Reservation</Link>
        <Link to="/app/bookings">My Bookings</Link>
        {user?.role === "admin" ? <Link to="/app/admin/venues">Add Venue</Link> : null}
        <button onClick={logout}>Logout</button>
      </nav>
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route path="venues" element={<BrowseVenues />} />
            <Route path="reservations/new" element={<CreateReservation />} />
            <Route path="bookings" element={<UserBookings />} />
            <Route path="admin/venues" element={<AdminAddVenue />} />
            <Route index element={<Navigate to="venues" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;