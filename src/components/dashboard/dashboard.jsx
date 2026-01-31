import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './dashboard.css'
import { FiUser, FiLogOut, FiChevronDown, FiUsers, FiLock } from 'react-icons/fi'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { projectService } from '../../services/projectService'
import ProjectForm from './table_detail/table_detail'
import ChangePassword from './change_password/change_password'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
ModuleRegistry.registerModules([AllCommunityModule])
//Xử lý ngày theo tuần
const getISOWeekInfo = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return { week, year: d.getUTCFullYear() }
}

const getWeekRangeByOffset = (offset = 0) => {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - now.getDay() + 1 + offset * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const { week, year } = getISOWeekInfo(monday)

  return { monday, sunday, week, year }
}

const formatDate = (d) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}`

const Dashboard = () => {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('Người dùng')
  const [openMenu, setOpenMenu] = useState(false)
  const [rowData, setRowData] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [isAll, setIsAll] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekTitle, setWeekTitle] = useState('')
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editPlan, setEditPlan] = useState(null)
  const [showChangePass, setShowChangePass] = useState(false)
  const [notification, setNotification] = useState(null)
  const [statusFilter, setStatusFilter] = useState('Đang thực hiện')
  const userData = JSON.parse(localStorage.getItem('userData') || '{}') 
  const isAdmin = userData.role === 'admin'
  useEffect(() => {
    const { monday, sunday, week, year } = getWeekRangeByOffset(weekOffset)
    const title =
      weekOffset === 0
        ? `Tuần này (${formatDate(monday)} – ${formatDate(sunday)})`
        : `Tuần ${week}/${year} (${formatDate(monday)} – ${formatDate(sunday)})`
    setWeekTitle(title)
  }, [weekOffset])

  /* ===== LOAD USER ===== */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('userData') || '{}')
    setDisplayName(stored.full_name || 'Người dùng')
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [weekOffset, isAll])

  const fetchProjects = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const params = {}

    if (userData.role) params.role = userData.role
    if (userData.employee_code && userData.role !== 'admin') {
      params.employee_code = userData.employee_code
    } 
    if (!isAll) {
      const { monday, sunday, week, year } = getWeekRangeByOffset(weekOffset)
      params.monday = monday.toISOString().slice(0, 10)
      params.sunday = sunday.toISOString().slice(0, 10)

      setWeekTitle(
        weekOffset === 0
          ? `Tuần này`
          : `Tuần ${week}/${year}`
      )
    } else {
      setWeekTitle('Tất cả dự án')
    }
//Lấy dữ liệu về bảng project
    const res = await projectService.getProjects(params)
    const rows = Array.isArray(res) ? res : []
    setRowData(rows)

  } catch (err) {
    console.error(err)
  }
}
const showNotify = (type, message, timeout = 10000) => {
  setNotification({ type, message })
  setTimeout(() => setNotification(null), timeout)
}
const filteredRowData = useMemo(() => {
  if (statusFilter === 'all') return rowData
  return rowData.filter(row => row.status === statusFilter)
}, [rowData, statusFilter])

// Cấu hình cột trong bảng
  const defaultColDef = {
    sortable: true,
    resizable: true,
    wrapText: true,
    autoHeight: true,
  }
  const columnDefs = useMemo(
  () => [
     {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 100,
      cellStyle: {
        display: 'block',        
        textAlign: 'left',      
        whiteSpace: 'pre-line',
      },
    },
  
    { field: 'full_name', headerName: 'Người thực hiện', flex: 2 },
    { field: 'employee_code', headerName: 'Mã NV' },
    { field: 'category', headerName: 'Hạng mục' },
    { field: 'description', headerName: 'Mô tả', flex: 2,cellStyle: {
        display: 'block',        
        textAlign: 'left',      
        whiteSpace: 'pre-line',
      },
    },
    { field: 'status', headerName: 'Hiện trạng' },
    {
    field: 'plan_content',
    headerName: 'Kế hoạch',
    flex: 2,

    cellClass: (params) =>
      params.value ? 'plan-cell-has' : 'plan-cell-empty',

    cellStyle: {
      whiteSpace: 'pre-line',
      cursor: 'pointer'
    },

    valueFormatter: (params) =>
      params.value || '+ Thêm kế hoạch',

    onCellClicked: (params) => {
      setEditPlan({
        projectId: params.data.id,
        content: params.data.plan_content || '',
        date: params.data.plan_date
          ? new Date(params.data.plan_date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      })
    setShowPlanModal(true)
        }
      },
    {
      field: 'plan_date',
      headerName: weekTitle,
      hide: true,
      valueFormatter: (p) =>
        p.value ? new Date(p.value).toLocaleDateString('vi-VN') : '',
    },
  ],
  [weekTitle]
)

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }
//Xử lý giao diện
  // Header
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Link to="/dashboard" className="header-home-link">
          <h1>VCC GROUP</h1>
          <p>
            Chào mừng bạn, <b>{displayName}</b>!
          </p>
        </Link>
        {/* Giao diện thông tin tài khoản phân quyền */}
          <div className="user-wrapper">
            <div className="user-actions">
              {isAdmin && (
                <div
                  className="admin-manage-icon"
                  title="Quản lý tài khoản"
                  onClick={() => navigate('/profile-role')}
                >
                  <FiUsers size={18} />
                  <span>QL User</span>
                </div>
              )}

              <div className="user-box" onClick={() => setOpenMenu(!openMenu)}>
                <FiUser />
                <span>{displayName}</span>
                <FiChevronDown />
              </div>
            </div>

            {openMenu && (
              <div className="user-menu">
                <div 
                  className="menu-item"
                  onClick={() => {
                    setShowChangePass(true)
                    setOpenMenu(false)
                  }}
                >
                  <FiLock style={{ marginRight: '8px' }} />
                  Đổi mật khẩu
                </div>
                <div className="menu-item" onClick={handleLogout}>
                  <FiLogOut /> Đăng xuất
                </div>
              </div>
            )}
          </div>
      </header>
{/* //content */}
            {showChangePass && (
              <div className="change-password-modal-overlay">
                <div className="change-password-modal">
                  <ChangePassword
                    onClose={() => setShowChangePass(false)}
                    onSuccess={() => {
                      setShowChangePass(false)
                      localStorage.clear()
                      navigate('/login')
                    }}
                  />
                </div>
              </div>
            )}
      <div className="dashboard-content">
        {notification && (
          <div className={`dashboard-alert ${notification.type}`}>
            {notification.message}
            <button onClick={() => setNotification(null)}>✖</button>
          </div>
        )}

        <div className="toolbar">
          <div className="toolbar-left">
          <div className="crud-actions">
            <button
              onClick={() => {
                setEditId(null)
                setShowModal(true)
              }}
            >
              Thêm
            </button>

            <button
              disabled={selectedRows.length !== 1}
              onClick={() => {
                setEditId(selectedRows[0].id)
                setShowModal(true)
              }}
            >
              Sửa
            </button>

            <button
              disabled={selectedRows.length === 0}
              onClick={async () => {
                if (!window.confirm('Bạn có chắc muốn xoá không?')) return

                try {
                  for (const row of selectedRows) {
                    await projectService.deleteProject(row.id)
                  }

                  setSelectedRows([])
                  fetchProjects()

                  showNotify(
                    'success',
                    `Đã xoá ${selectedRows.length} dự án`
                  )
                } catch (err) {
                  console.error(err)
                  showNotify('error', 'Xoá dự án thất bại')
                }
              }}
            >
              Xoá
            </button>
            </div>
          </div>
            <div className="toolbar-right">
          <div className="week-nav">
            <button
              onClick={() => {
                setIsAll(false)
                setWeekOffset(w => w - 1)
              }}
            >
              ⬅
            </button>

            <span className="week-title">{weekTitle}</span>

            <button
              onClick={() => {
                setIsAll(false)
                setWeekOffset(w => w + 1)
              }}
            >
              ➡
            </button>
          </div>
          <div className="status-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="Đang thực hiện">Đang thực hiện</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
          </select>
        </div>
        </div>
        </div>
{/* Cấu hình bảng */}
        <div
          className="ag-theme-alpine"
          style={{ height: '75vh', width: '100%' }}
        >
          <AgGridReact
            theme="legacy"
            rowData={filteredRowData}
            onGridReady={(p) => (window.gridApi = p.api)}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowSelection="multiple"
            pagination ={true}
            onSelectionChanged={(e) =>
              setSelectedRows(e.api.getSelectedRows())
            }
          />
        </div>

{/* Tạo modal */}
    {/* Mở Modal CRUD */}
        {showModal && (
          <div className="project-modal-overlay">
            <div className="project-modal-content">
              <ProjectForm
                id={editId}
                onClose={() => {
                  setShowModal(false)
                  setEditId(null)
                }}
                onSuccess={(msg) => {
                  setShowModal(false)
                  setEditId(null)
                  fetchProjects()

                  setNotification({
                    type: 'success',
                    message: msg || 'Lưu dự án thành công'
                  })

                  setTimeout(() => setNotification(null), 3000)
                }}
                onError={(msg) => {
                  setNotification({
                    type: 'error',
                    message: msg || 'Có lỗi xảy ra'
                  })

                  setTimeout(() => setNotification(null), 4000)
                }}
              />
            </div>
          </div>
        )}
    {/* Mở Modal bảng kế hoạch tuần */}
        {showPlanModal && (
        <div className="plan-modal-overlay">
          <div className="plan-modal-content">
            <div className="plan-modal-header">
              <h3>Kế hoạch tuần</h3>

              <button
                className="btn-close"
                onClick={() => setShowPlanModal(false)}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <textarea
              rows={6}
              value={editPlan.content}
              onChange={(e) =>
                setEditPlan({ ...editPlan, content: e.target.value })
              }
            />

            {/* <input
              type="date"
              value={editPlan.date}
              onChange={(e) =>
                setEditPlan({ ...editPlan, date: e.target.value })
              }
            /> */}

            <div className="plan-modal-actions">
            <button
              className="btn-save"
              onClick={async () => {
                try {
                  await projectService.upsertPlan({
                    project_id: editPlan.projectId,
                    content: editPlan.content,
                    date: editPlan.date,
                  })

                  setShowPlanModal(false)
                  fetchProjects()

                  showNotify('success', 'Cập nhật kế hoạch thành công')
                } catch (err) {
                  console.error(err)
                  showNotify('error', 'Cập nhật kế hoạch thất bại')
                }
              }}
            >
              <SaveIcon fontSize="small" />
              Lưu
            </button>

          </div>

          </div>
        </div>
      )}

      </div>

      <footer className="dashboard-footer">
        <p>DEMO</p>
      </footer>
    </div>
  )
}

export default Dashboard
