import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../app/features/themeSlice'

const ThemeToggle = () => {
  const dispatch = useDispatch()
  const { mode } = useSelector(state => state.theme)

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="relative w-14 h-7 bg-slate-200 dark:bg-slate-700 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute top-1 left-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          mode === 'dark' ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {mode === 'light' ? (
          <Sun className="w-3 h-3 text-amber-500" />
        ) : (
          <Moon className="w-3 h-3 text-indigo-400" />
        )}
      </div>
    </button>
  )
}

export default ThemeToggle