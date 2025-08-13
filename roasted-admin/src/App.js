import React, { useState, useEffect } from 'react';
import Dashboard from "./components/Dashboard";
import ReportTable from "./components/ReportTable";
import Statistics from "./components/Statistics";
import LoginPage from './components/Login';  

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check session on first load
  useEffect(() => {
    fetch("http://localhost:5002/api/check-session", { credentials: "include" })
      .then(res => res.json())
      .then(data => setIsLoggedIn(data.logged_in))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    fetch("http://localhost:5002/api/logout", {
      method: "POST",
      credentials: "include"
    }).then(() => setIsLoggedIn(false));
  };

  return isLoggedIn ? (
    <>
      <Dashboard isLoggedIn={isLoggedIn} onLoginToggle={handleLogout}>
        <ReportTable />
        <Statistics />  
      </Dashboard>
    </>
  ) : (
    <LoginPage isLoggedIn={isLoggedIn} onLoginToggle={handleLogin} />
  );
}

export default App;