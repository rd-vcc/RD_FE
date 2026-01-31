import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import Login from './components/login/login'
import Dashboard from './components/dashboard/dashboard'
import ProfileRole from './components/profile_role/profile_role'
import './App.css'
import ProjectForm from './components/dashboard/table_detail/table_detail'
import ChangePassword from './components/dashboard/change_password/change_password'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="table_detail">
            <Route path="add" element={<ProjectForm />} />
            <Route path="edit/:id" element={<ProjectForm />} />
          </Route>
        </Route>

        <Route
          path="/profile-role"
          element={
            <PrivateRoute>
              <ProfileRole />
            </PrivateRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <ChangePassword />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}


export default App