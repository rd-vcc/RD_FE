import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import './profile_role.css'
import { projectService } from '../../services/projectService'
import SaveIcon from '@mui/icons-material/Save'
const ProfileRole = () => {
  const navigate = useNavigate()

  const [rowData, setRowData] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    id: null,
    employee_code: '',
    full_name: '',
    username: '',
    password: '',
    role: 'user',
  })

  /* ===== CHECK ADMIN ===== */
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    if (userData.role !== 'admin') {
      navigate('/dashboard')
    }
  }, [navigate])

  /* ===== LOAD USERS ===== */
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await projectService.getAllUsers()
      
      if (response && response.data && Array.isArray(response.data)) {
        setRowData(response.data)
      } else if (Array.isArray(response)) {
        setRowData(response)
      } else {
        setRowData([])
      }
    } catch (err) {
      setError('Không thể tải danh sách tài khoản')
      setRowData([])
    } finally {
      setLoading(false)
    }
  }

  /* ===== TABLE CONFIG ===== */
  const columnDefs = useMemo(
    () => [
      {
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 100,
      },
      { 
        field: 'employee_code', 
        headerName: 'Mã NV', 
        flex: 2,
      },
      { 
        field: 'full_name', 
        headerName: 'Họ tên', 
        flex: 2,
      },
      { 
        field: 'username', 
        headerName: 'Tài khoản',
        flex:2,
      },
      {
        field: 'role',
        headerName: 'Vai trò',
        flex:1,
        cellRenderer: (params) => params.value === 'admin' ? 'Admin' : 'User'
      }
    ],
    []
  )

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  )

  /* ===== CRUD FUNCTIONS ===== */
  const openAdd = () => {
    setFormData({
      id: null,
      employee_code: '',
      full_name: '',
      username: '',
      password: '',
      role: 'user',
    })
    setShowModal(true)
  }

  const openEdit = () => {
    if (selectedRows.length !== 1) {
      alert('Vui lòng chọn một tài khoản để sửa')
      return
    }
    
    const user = selectedRows[0]
    setFormData({
      id: user.id,
      employee_code: user.employee_code || '',
      full_name: user.full_name || '',
      username: user.username || '',
      password: '',
      role: user.role || 'user',
    })
    setShowModal(true)
  }

  const deleteUsers = async () => {
    if (!selectedRows.length) {
      alert('Vui lòng chọn ít nhất một tài khoản')
      return
    }
    
    if (!window.confirm(`Xác nhận xoá ${selectedRows.length} tài khoản đã chọn?`)) {
      return
    }

    try {
      await Promise.all(selectedRows.map(user => projectService.deleteUser(user.id)))
      setSelectedRows([])
      loadUsers()
    } catch (err) {
      alert('Xoá thất bại')
    }
  }

  const saveUser = async () => {
  setError('')
  setSuccess('')

  if (!formData.employee_code.trim()) {
    setError('Vui lòng nhập mã nhân viên')
    return
  }
  if (!formData.username.trim()) {
    setError('Vui lòng nhập tên đăng nhập')
    return
  }
  if (!formData.id && !formData.password.trim()) {
    setError('Vui lòng nhập mật khẩu')
    return
  }

  setLoading(true)

  try {
    const userData = {
      employee_code: formData.employee_code.trim(),
      username: formData.username.trim(),
      full_name: formData.full_name.trim(),
      role: formData.role,
    }

    if (formData.password.trim()) {
      userData.password = formData.password.trim()
    }

    if (formData.id) {
      await projectService.updateUser(formData.id, userData)
      setSuccess('Cập nhật tài khoản thành công')
    } else {
      await projectService.createUser(userData)
      setSuccess('Thêm tài khoản thành công')
    }

    setShowModal(false)
    loadUsers()
  } catch (err) {
    setError('Lưu thất bại')
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="profile-container">
      {/* Header */}
      <div className="header">
        <h2>Quản lý tài khoản </h2>
        <button 
          className="back-btn"
          onClick={() => navigate('/dashboard')}
        >
          ← Quay lại
        </button>
      </div>

      {/* Toolbar */}
      <div className="toollbar">
        <button className="btn add-btn" onClick={openAdd}>
          Thêm
        </button>
        <button 
          className="btn edit-btn" 
          onClick={openEdit}
          disabled={selectedRows.length !== 1}
        >
          Sửa
        </button>
        <button 
          className="btn delete-btn" 
          onClick={deleteUsers}
          disabled={selectedRows.length === 0}
        >
          Xoá
        </button>
      </div>
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <div className="loading">Đang tải...</div>}

      {/* Table */}
      <div className="ag-theme-alpine" style={{ height: '500px', width: '100%', marginTop: '20px' }}>
        <AgGridReact
          theme="legacy"
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection="multiple"
          onSelectionChanged={(e) => setSelectedRows(e.api.getSelectedRows())}
          pagination={true}
          paginationPageSize={20}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{formData.id ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-content">
              {error && <div className="form-error">{error}</div>}

              <div className="form-group">
                <label>
                Mã nhân viên <span className="required">*</span>
              </label>
                <input
                  value={formData.employee_code}
                  onChange={(e) => setFormData({...formData, employee_code: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>
                  Tên đăng nhập <span className="required">*</span>
                </label>
                <input
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>
                  Họ và tên <span className="required">*</span>
                </label>
                <input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>
                  {formData.id ? 'Mật khẩu mới' : 'Mật khẩu *'}
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Vai trò</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="icon-btn save"
                onClick={saveUser}
                disabled={loading}
              >
                <SaveIcon />
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileRole