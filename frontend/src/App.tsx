import { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

axios.defaults.withCredentials = true;

function App() {
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

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>  
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login setUser={setUser}/>} />
        <Route path="/register" element={<Register setUser={setUser}/>} />
      </Routes>
    </Router>
  )
}

export default App
