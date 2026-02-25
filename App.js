// src/App.js
import React, { useState, useEffect } from "react";
import Signup from "./components/Signup";
import Login from "./components/Login";
import DonorDashboard from "./components/DonorDashboard";
import PatientDashboard from "./components/PatientDashboard";
import HospitalDashboard from "./components/HospitalDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Notifications from "./components/Notifications";
import Profile from "./components/Profile";
import BloodStock from "./components/BloodStock";

import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch user data from Firestore
        const q = query(collection(db, "users"), where("uid", "==", currentUser.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setUserData(userData);
          setUserRole(userData.role);
        }
      } else {
        setUserRole(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time notification count
  useEffect(() => {
    if (user) {
      const notificationsQuery = query(
        collection(db, "bloodRequests"),
        where("status", "==", "pending")
      );
      
      const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        setNotificationCount(snapshot.size);
      });

      return () => unsubscribeNotifications();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      setUserData(null);
      setCurrentPage("dashboard");
      setShowProfileDropdown(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setShowProfileDropdown(false);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--background)'
      }}>
        <div className="ios-spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  if (!user) {
    return showSignup ? (
      <Signup setUserRole={setUserRole} setShowSignup={setShowSignup} />
    ) : (
      <Login setUserRole={setUserRole} setShowSignup={setShowSignup} />
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <>
            {userRole === "donor" && <DonorDashboard />}
            {userRole === "patient" && <PatientDashboard />}
            {userRole === "hospital" && <HospitalDashboard />}
            {userRole === "admin" && <AdminDashboard />}
          </>
        );
      case "blood-stock":
        return <BloodStock onClose={() => setCurrentPage("dashboard")} userRole={userRole} />;
      case "notifications":
        return <Notifications userRole={userRole} onClose={() => setCurrentPage("dashboard")} />;
      case "profile":
        return <Profile userData={userData} user={user} onClose={() => setCurrentPage("dashboard")} onLogout={handleLogout} />;
      default:
        return (
          <>
            {userRole === "donor" && <DonorDashboard />}
            {userRole === "patient" && <PatientDashboard />}
            {userRole === "hospital" && <HospitalDashboard />}
            {userRole === "admin" && <AdminDashboard />}
          </>
        );
    }
  };

  return (
    <div className="ios-app">
      {/* Professional Header */}
      <header className="ios-header">
        <div className="ios-header-content">
          <div className="ios-header-brand">
            <h1>🩸 BloodDonate</h1>
            <span className="ios-badge ios-badge-primary" style={{ fontSize: '12px' }}>
              {userRole}
            </span>
          </div>
          
          <div className="ios-header-actions">
            {/* Blood Stock Button */}
            <button 
              className={`ios-header-btn ${currentPage === 'blood-stock' ? 'active' : ''}`}
              onClick={() => handlePageChange('blood-stock')}
            >
              🩸 Blood Stock
            </button>

            {/* Notifications Button */}
            <div 
              className="ios-notification-btn"
              onClick={() => handlePageChange('notifications')}
            >
              🔔
              {notificationCount > 0 && (
                <span className="ios-notification-badge">
                  {notificationCount}
                </span>
              )}
            </div>

            {/* Profile Menu */}
            <div className="ios-profile-menu">
              <div 
                className="ios-profile-btn"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                {userData?.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              
              {showProfileDropdown && (
                <div className="ios-profile-dropdown">
                  <button 
                    className="ios-profile-item"
                    onClick={() => handlePageChange('profile')}
                  >
                    👤 Profile
                  </button>
                  <button 
                    className="ios-profile-item"
                    onClick={() => handlePageChange('dashboard')}
                  >
                    📊 Dashboard
                  </button>
                  <button 
                    className="ios-profile-item"
                    onClick={() => handlePageChange('blood-stock')}
                  >
                    🩸 Blood Stock
                  </button>
                  <button 
                    className="ios-profile-item"
                    onClick={() => handlePageChange('notifications')}
                  >
                    🔔 Notifications
                  </button>
                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '8px 0' }}></div>
                  <button 
                    className="ios-profile-item"
                    onClick={handleLogout}
                    style={{ color: 'var(--danger-color)' }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ios-main">
        <div className="ios-container">
          {renderCurrentPage()}
        </div>
      </main>

      {/* Close dropdown when clicking outside */}
      {showProfileDropdown && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </div>
  );
}

export default App;