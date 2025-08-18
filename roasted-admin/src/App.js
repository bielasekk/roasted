import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import ReportTable from "./components/ReportTable";
import Statistics from "./components/Statistics";
import LoginPage from "./components/Login";  
import ExtendedReports from "./components/ExtendedReports";
import ExtendedStatistics from "./components/ExtendedStatistics";
import Settings from "./components/Settings";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

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

  if (isLoggedIn === null) return <div>Loading...</div>;

  return (
    <Router>
      {isLoggedIn ? (
        <Dashboard isLoggedIn={isLoggedIn} onLoginToggle={handleLogout}>
          <Routes>
            <Route path="/" element={
              <>
                <ReportTable />
                <Statistics />  
              </>
            } />
            <Route path="/reports" element={<ExtendedReports />} />
            <Route path="/statistics" element={<ExtendedStatistics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Dashboard>
      ) : (
        <LoginPage isLoggedIn={isLoggedIn} onLoginToggle={handleLogin} />
      )}
    </Router>
  );
}

export default App;