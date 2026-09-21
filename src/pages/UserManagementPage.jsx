import { useState } from 'react'
import { PlusIcon } from '../components/icons'
import { USER_ROLES } from '../data/users'
import './UserManagementPage.css'

const COLUMNS = '100px minmax(140px, 1.3fr) minmax(200px, 1.6fr) 130px 110px'

const emptyForm = { name: '', email: '', role: USER_ROLES[0] }

export default function UserManagementPage({ users, onAddUser, onToggleStatus }) {
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const canSubmit = form.name.trim().length > 0 && form.email.trim().length > 0

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    onAddUser({ name: form.name.trim(), email: form.email.trim(), role: form.role })
    setForm(emptyForm)
    setIsAdding(false)
  }

  function handleCancel() {
    setForm(emptyForm)
    setIsAdding(false)
  }

  return (
    <div className="user-mgmt">
      <div className="user-mgmt__intro">
        <h1 className="user-mgmt__title">User Management</h1>
        <p className="user-mgmt__subtitle">
          Admin users who can access the LMS, review applications and configure products.
        </p>
      </div>

      <div className="user-mgmt__table-wrap">
        <div className="user-mgmt__table" role="table">
          <div className="data-row data-row--head" role="row" style={{ gridTemplateColumns: COLUMNS }}>
            <span role="columnheader">User ID</span>
            <span role="columnheader">Name</span>
            <span role="columnheader">Email</span>
            <span role="columnheader" className="center-col">Role</span>
            <span role="columnheader" className="center-col">Status</span>
          </div>

          <div role="rowgroup">
            {users.map((u) => (
              <div key={u.id} role="row" className="data-row data-row--body" style={{ gridTemplateColumns: COLUMNS }}>
                <span role="cell" className="num">{u.id}</span>
                <span role="cell" className="user-mgmt__name-cell">{u.name}</span>
                <span role="cell">{u.email}</span>
                <span role="cell" className="center-col">
                  <span className="pill pill-primary">{u.role}</span>
                </span>
                <span role="cell" className="center-col">
                  <button
                    type="button"
                    className={`user-mgmt__status-btn user-mgmt__status-btn--${u.status}`}
                    onClick={() => onToggleStatus(u.id)}
                  >
                    {u.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAdding ? (
        <form className="admin-add-form" onSubmit={handleSubmit}>
          <div className="admin-add-grid">
            <label className="admin-field">
              <span>Name</span>
              <input
                type="text"
                value={form.name}
                onChange={updateField('name')}
                placeholder="e.g. Dara Chan"
                autoFocus
              />
            </label>
            <label className="admin-field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={updateField('email')}
                placeholder="name@wingbank.com.kh"
              />
            </label>
            <label className="admin-field">
              <span>Role</span>
              <select value={form.role} onChange={updateField('role')}>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-add-actions">
            <button type="button" className="admin-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="admin-submit-btn" disabled={!canSubmit}>
              Add User
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="admin-add-trigger" onClick={() => setIsAdding(true)}>
          <PlusIcon />
          <span>Add new user</span>
        </button>
      )}
    </div>
  )
}
