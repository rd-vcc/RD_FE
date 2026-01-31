import React, { useState, useEffect } from 'react'
import { FiEye, FiEyeOff, FiX, FiLock } from 'react-icons/fi'
import { projectService } from '../../../services/projectService'
import './change_password.css'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
const ChangePassword = ({ onClose, onSuccess }) => {
  const [userInfo, setUserInfo] = useState({
    full_name: '',
    username: '',
    employee_code: ''
  })

  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  const userId = userData.id

  useEffect(() => {
    if (!userId) return
    fetchUserInfo()
  }, [userId])

  const fetchUserInfo = async () => {
    try {
      const user = await projectService.getUserById(userId)
      if (user) {
        setUserInfo({
          full_name: user.full_name || '',
          username: user.username || '',
          employee_code: user.employee_code || ''
        })
      }
    } catch {
      setMessage({ type: 'error', text: 'Không thể tải thông tin người dùng' })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (message.text) setMessage({ type: '', text: '' })
  }

  const togglePassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validate = () => {
    if (!formData.old_password) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu cũ' })
      return false
    }
    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'Xác nhận mật khẩu không khớp' })
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      const res = await projectService.changePassword({
        user_id: userId,
        old_password: formData.old_password,
        new_password: formData.new_password
      })

      if (res?.success) {
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công' })
        setTimeout(() => {
          onSuccess?.()
        }, 800)
      } else {
        setMessage({ type: 'error', text: res?.message || 'Đổi mật khẩu thất bại' })
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Có lỗi xảy ra'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="change-password-card">
      <div className="cp-header">
        <h3><FiLock style={{ marginRight: '9px' }} />Đổi mật khẩu</h3>
        <button className="cp-close" onClick={onClose}>
          <FiX />
        </button>
      </div>

        <div className="cp-user-info">
        <div>
            <span className="cp-label">Họ tên:</span>
            <span className="cp-value">{userInfo.full_name}</span>
        </div>

        <div>
            <span className="cp-label">Tên đăng nhập:</span>
            <span className="cp-value">{userInfo.username}</span>
        </div>

        <div>
            <span className="cp-label">Mã nhân viên:</span>
            <span className="cp-value">{userInfo.employee_code}</span>
        </div>
        </div>


      {message.text && (
        <div className={`cp-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* OLD */}
        <div className="cp-field">
          <label>Mật khẩu hiện tại</label>
          <div className="cp-password">
            <input
              type={showPassword.old ? 'text' : 'password'}
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
            />
            <span onClick={() => togglePassword('old')}>
              {showPassword.old ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        {/* NEW */}
        <div className="cp-field">
          <label>Mật khẩu mới</label>
          <div className="cp-password">
            <input
              type={showPassword.new ? 'text' : 'password'}
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
            />
            <span onClick={() => togglePassword('new')}>
              {showPassword.new ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        {/* CONFIRM */}
        <div className="cp-field">
          <label>Xác nhận mật khẩu</label>
          <div className="cp-password">
            <input
              type={showPassword.confirm ? 'text' : 'password'}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
            />
            <span onClick={() => togglePassword('confirm')}>
              {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        <div className="cp-actions">
          <button
            type="submit"
            className="icon-btn save"
            disabled={loading}
         
          >
            <SaveIcon />Lưu
          </button>
        </div>

      </form>
    </div>
  )
}

export default ChangePassword
