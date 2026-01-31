import { useEffect, useState } from 'react'
import { projectService } from '../../../services/projectService'
import './table_detail.css'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
const ProjectForm = ({ id, onClose, onSuccess,onError  }) => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  const isAdmin = userData.role === 'admin'
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [fullName, setFullName] = useState('')
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    employee_code: '',
    category: '',
    description: '',
    status: 'Đang thực hiện'
  })
//Check quyền admin
 useEffect(() => {
  if (!isAdmin) return

  projectService.getAllUsers()
  .then(data => {
    setUsers(data)
  })
  .catch(err => console.error(err))
}, [isAdmin])
//Check quyền user
useEffect(() => {
  if (!id) return

  setLoading(true)
  projectService.getProjectById(id)
    .then(data => {
      setForm({
        employee_code: data.employee_code || '',
        category: data.category || '',
        description: data.description || '',
        status: data.status || ''
      })

      setFullName(data.full_name || '')
    })
    .finally(() => setLoading(false))
}, [id])
// Auto fill cho USER THƯỜNG khi THÊM MỚI
useEffect(() => {
  if (isAdmin) return
  if (id) return   

  setForm(prev => ({
    ...prev,
    employee_code: userData.employee_code || '',
    status: 'Đang thực hiện'
  }))

  setFullName(userData.full_name || '')
}, [])
// Xử lý khi admin chọn mã nhân viên
// - Cập nhật employee_code vào form
  const handleEmployeeChange = (e) => {
  const code = e.target.value
  const user = users.find(u => u.employee_code === code)

  setForm(prev => ({
    ...prev,
    employee_code: code
  }))
  setFullName(user?.full_name || '')
}
// Xử lý thay đổi giá trị các field trong form
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }
//Validate dữ liệu
  const validate = () => {
  const newErrors = {}

  if (!form.employee_code) newErrors.employee_code = 'Vui lòng chọn mã nhân viên'
  if (!form.category) newErrors.category = 'Vui lòng nhập hạng mục'
  if (!form.status) newErrors.status = 'Vui lòng chọn hiện trạng'

  setErrors(newErrors)

  if (Object.keys(newErrors).length > 0) {
    setFormError('Vui lòng điền đầy đủ các trường bắt buộc (*)')
    return false
  }

  setFormError('')
  return true
}
//Hàm xử lý lưu dữ liệu
  const handleSubmit = async (e) => {
  e.preventDefault()
  if (!validate()) return

  setLoading(true)
  try {
  if (id) {
    await projectService.updateProject(id, {
      role: userData.role,
      employee_code: isAdmin
        ? form.employee_code
        : userData.employee_code,
      category: form.category,
      description: form.description,
      status: form.status
    })

    onSuccess?.('Cập nhật dự án thành công')
  } else {
    await projectService.createProject({
      employee_code: form.employee_code,
      category: form.category,
      description: form.description,
      status: form.status
    })

    onSuccess?.('Thêm mới dự án thành công')
  }
} catch (err) {
  console.error(err)
  onError?.('Không thể lưu dự án, vui lòng thử lại')
} finally {
  setLoading(false)
}

}

// Xử lý giao diện
  return (
    <div className="project-form">
      <div className="project-form-header">
        <h2>{id ? 'SỬA DỰ ÁN' : 'THÊM DỰ ÁN'}</h2>

        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          disabled={loading}
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>
      {formError && <div className="form-error">{formError}</div>}
      <form onSubmit={handleSubmit}>
         {isAdmin ? (
          <div>
            <label>Mã NV <span className="required">*</span></label>
            <select value={form.employee_code} onChange={handleEmployeeChange}>
              <option value="">-- Chọn nhân viên --</option>
              {Array.isArray(users) && users.map(u => (
                <option key={u.employee_code} value={u.employee_code}>
                  {u.employee_code} - {u.full_name}
                </option>
              ))}
            </select>
            {errors.employee_code && <span className="error">{errors.employee_code}</span>}
          </div>
        ) : (
          <div>
            <label>Mã NV</label>
            <input value={form.employee_code} disabled />
          </div>
        )}
        <div>
          <label>Người thực hiện</label>
          <input value={fullName} disabled />
        </div>
       
        <div>
          <label>Hạng mục <span className="required">*</span></label>
          <input name="category" value={form.category} onChange={handleChange} />
          {errors.category && <span className="error">{errors.category}</span>}
        </div>

        <div>
          <label>Mô tả</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>

        <div>
          <label>Hiện trạng <span className="required">*</span></label>
          <select name="status" value={form.status} onChange={handleChange}>
        
              <option value="Đang thực hiện">Đang thực hiện</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
          </select>

          {errors.status && <span className="error">{errors.status}</span>}
        </div>
        <div className="form-actions">

          <button type="submit" disabled={loading}>
            {loading ? (
              'Đang lưu...'
            ) : id ? (
              <>
                <SaveIcon fontSize="small" />
                Cập nhật
              </>
            ) : (
              <>
                <AddIcon fontSize="small" />
                Thêm mới
              </>
            )}
          </button>

         
        </div>

      </form>
    </div>
  )
}

export default ProjectForm
