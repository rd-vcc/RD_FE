import { data } from 'react-router-dom'
import api from './api'

export const projectService = {
  //project
  getProjects: (params) => {
    return api.get('/project', { params })
  },

  createProject: (data) => {
    return api.post('/project', data)
  },

  updateProject: (id, data) => {
    return api.put(`/project/${id}`, data)
  },

  deleteProject: (id) => {
    return api.delete(`/project/${id}`)
  },

  getProjectById: (id) => {
    return api.get(`/project/${id}`)
  },
  //plan
  upsertPlan: (data) => {
  return api.put('/plan', data)
  },
  //user role
   getAllUsers: (params) => {
    return api.get('/users', { params })
  },

  getUserById: (id) => {
    return api.get(`/users/${id}`)
  },

  createUser: (data) => {
  return api.post('/users', data)
  },

  updateUser: (id, data) => {
    return api.put(`/users/${id}`, data)
  },

  deleteUser: (id) => {
    return api.delete(`/users/${id}`)
  },
  changePassword: (data) => {
  return api.post('/users/change-password', data)
}
}
