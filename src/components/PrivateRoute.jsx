import React from 'react'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default PrivateRoute