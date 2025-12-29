// src/app/features/themeSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  mode: localStorage.getItem('theme') || 'light'
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.mode)
      
      // Update document class
      if (state.mode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setTheme: (state, action) => {
      state.mode = action.payload
      localStorage.setItem('theme', action.payload)
      
      // Update document class
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer