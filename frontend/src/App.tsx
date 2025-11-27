import { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import User from "./pages/User";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Reservation from "./pages/ReservationParking";
import StripeSuccess from "./pages/StripeSuccess";
import StripeRefresh from "./pages/StripeRefresh";


// Configurar axios para enviar cookies en todas las peticiones
axios.defaults.withCredentials = true;

export default function App() {
  const [user, setUser] = useState(null);
  // const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/auth/me")
        setUser(res.data);
      }
      catch(error) {
        setUser(null);
      }
      finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  // agregar que para user necesita estar autenticado
  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>  
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login setUser={setUser}/>} />
        <Route path="/register" element={<Register setUser={setUser}/>} />
        <Route path="/reservation" element={<Reservation user={user} />} />
        <Route path="/user" element={<User user={user} setUser={setUser}/>} /> 
        {/* <Route path="/user/settings" element={<UserSettings />} /> */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact user={user} />} />

        {/* Rutas de callback de Stripe */}
        <Route path="/stripe-success" element={<StripeSuccess />} />
        <Route path="/stripe-refresh" element={<StripeRefresh />} />
      </Routes>
    </Router>
  )
}