import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import CandidateNotes from "./components/CandidateNotes";
import Layout from "./components/Layout";
import { Toaster } from "sonner";
import SocketTest from "./hooks/socketTest";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const token = localStorage.getItem("token");
  console.log(token, "token in app");

  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {!token && (
              <>
                <Route path="/login" element={<AuthForm type="login" />} />
                <Route path="/signup" element={<AuthForm type="signup" />} />
              </>
            )}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/candidate/:id"
              element={
                <PrivateRoute>
                  <CandidateNotes />
                </PrivateRoute>
              }
            />
            <Route path="/socket-test" element={<SocketTest />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
