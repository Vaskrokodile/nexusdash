import { createContext, useContext, useReducer, useCallback } from 'react'

const DashboardContext = createContext(null)

const initialState = {
  clients: [],
  users: [],
  loading: false,
  error: null,
  selectedClient: null
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload, loading: false, error: null }
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload], loading: false }
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c),
        selectedClient: state.selectedClient?.id === action.payload.id ? action.payload : state.selectedClient
      }
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(c => c.id !== action.payload)
      }
    case 'SET_SELECTED_CLIENT':
      return { ...state, selectedClient: action.payload }
    case 'SET_USERS':
      return { ...state, users: action.payload, loading: false, error: null }
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload], loading: false }
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload.id ? action.payload : u)
      }
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload)
      }
    default:
      return state
  }
}

export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const getToken = () => localStorage.getItem('nexus_token')

  const fetchClients = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await fetch('/api/clients', {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (res.ok) {
        dispatch({ type: 'SET_CLIENTS', payload: data.clients })
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error })
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch clients' })
    }
  }, [])

  const createClient = useCallback(async (clientData) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(clientData)
      })
      const data = await res.json()
      if (res.ok) {
        dispatch({ type: 'ADD_CLIENT', payload: data.client })
        return data.client
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error })
        throw new Error(data.error)
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      throw err
    }
  }, [])

  const updateClient = useCallback(async (id, clientData) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(clientData)
      })
      const data = await res.json()
      if (res.ok) {
        dispatch({ type: 'UPDATE_CLIENT', payload: data.client })
        return data.client
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error })
        throw new Error(data.error)
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      throw err
    }
  }, [])

  const deleteClient = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (res.ok) {
        dispatch({ type: 'DELETE_CLIENT', payload: id })
      } else {
        const data = await res.json()
        dispatch({ type: 'SET_ERROR', payload: data.error })
        throw new Error(data.error)
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      throw err
    }
  }, [])

  const selectClient = useCallback((client) => {
    dispatch({ type: 'SET_SELECTED_CLIENT', payload: client })
  }, [])

  const fetchUsers = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (res.ok) {
        dispatch({ type: 'SET_USERS', payload: data })
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error })
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch users' })
    }
  }, [])

  const createUser = useCallback(async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(userData)
      })
      const data = await res.json()
      if (res.ok) {
        dispatch({ type: 'ADD_USER', payload: data })
        return data
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error })
        throw new Error(data.error)
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      throw err
    }
  }, [])

  const updateUser = useCallback(async (id, userData) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(userData)
      })
      const data = await res.json()
      if (res.ok) {
        dispatch({ type: 'UPDATE_USER', payload: data })
        return data
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error })
        throw new Error(data.error)
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      throw err
    }
  }, [])

  const deleteUser = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (res.ok) {
        dispatch({ type: 'DELETE_USER', payload: id })
      } else {
        const data = await res.json()
        dispatch({ type: 'SET_ERROR', payload: data.error })
        throw new Error(data.error)
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
      throw err
    }
  }, [])

  return (
    <DashboardContext.Provider value={{
      ...state,
      fetchClients,
      createClient,
      updateClient,
      deleteClient,
      selectClient,
      fetchUsers,
      createUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
