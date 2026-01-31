import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import './login.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedUsername = localStorage.getItem('savedUsername')
    if (savedUsername) {
      setUsername(savedUsername)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    try {
      setIsLoading(true)

      // GỌI API LOGIN
      const res = await authService.login({
        username,
        password
      })

      //  LƯU TOKEN + USER
      localStorage.setItem('token', res.token)
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userData', JSON.stringify(res.user))

      if (rememberMe) {
        localStorage.setItem('savedUsername', username)
      } else {
        localStorage.removeItem('savedUsername')
      }

      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error) => {
    if (error?.response?.data?.message) return error.response.data.message
    if (error?.message) return error.message
    return 'Đăng nhập thất bại!'
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Hệ Thống R&D</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên đăng nhập:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Ghi nhớ đăng nhập
          </label>
          <br></br>
          <button
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
