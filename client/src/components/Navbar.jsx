import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../app/features/authSlice'
import { useLanguage } from '../contexts/LanguageContext'
import { getTranslation } from '../locales/translations'
import LanguageSelector from './LanguageSelector'
import api from '../configs/api.js'
import toast from 'react-hot-toast'
import {
  Briefcase, MessageSquare, FileText, Target,
  Bookmark, User, Users, LogOut, ChevronDown, Plus, Home, Bell, X, Check, Eye
} from 'lucide-react'

const Navbar = () => {
  const { user, token } = useSelector(state => state.auth)
  const { language } = useLanguage()
  const t = (key) => getTranslation(language, key)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  // Load notifications
  useEffect(() => {
    if (token) {
      loadNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [token])

  const loadNotifications = async () => {
    if (!token) return

    try {
      const { data } = await api.get('/api/notifications', {
        headers: { Authorization: token }
      })
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: token }
      })
      // Update local state
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all', {}, {
        headers: { Authorization: token }
      })
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: token }
      })
      setNotifications(notifications.filter(n => n._id !== notificationId))
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id)
    setShowNotifications(false)
    navigate(`/app/discussions/${notification.discussionId._id}`)
  }

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + ' years ago'

    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + ' months ago'

    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + ' days ago'

    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + ' hours ago'

    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + ' minutes ago'

    return 'just now'
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const logoutUser = () => {
    navigate('/')
    dispatch(logout())
  }

  const isActive = (path) => {
    return location.pathname.startsWith(path)
  }

  return (
    <div className='shadow bg-white dark:bg-slate-900 transition-colors duration-300 sticky top-0 z-50'>
      <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 dark:text-slate-200 transition-colors'>

        {/* Logo & Dashboard */}
        <div className='flex items-center gap-3'>
          <Link to='/app' className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
            <img src="/logo.svg" alt="" className='h-11 w-auto' />
          </Link>

          {/* Only show dashboard icon if NOT on dashboard page */}
          {location.pathname !== '/app' && (
            <Link
              to='/app'
              className='p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
              title="Dashboard"
            >
              <Home className='size-6' />
            </Link>
          )}
        </div>

        {/* Right Side Actions */}
        <div className='flex items-center gap-4'>
          {/* Language Selector */}
          <LanguageSelector />

          {/* Post Job Button (Desktop only) */}
          <button
            onClick={() => navigate('/app/jobs/create')}
            className='hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors'
          >
            <Plus className='size-4' />
            {t('postJob')}
          </button>

          {/* Notifications */}
          <div className='relative' ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className='relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors'
            >
              <Bell className='size-6' />
              {unreadCount > 0 && (
                <span className='absolute -top-1 -right-1 size-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-semibold'>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className='absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-[32rem] overflow-hidden flex flex-col'>
                {/* Header */}
                <div className='px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between'>
                  <h3 className='font-semibold text-slate-900 dark:text-white'>
                    {t('notifications')} {unreadCount > 0 && `(${unreadCount})`}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className='text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1'
                    >
                      <Check className='size-3' />
                      {t('markAllRead')}
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className='overflow-y-auto flex-1'>
                  {notifications.length === 0 ? (
                    <div className='px-4 py-8 text-center text-slate-500 dark:text-slate-400'>
                      <Bell className='size-12 mx-auto mb-2 opacity-50' />
                      <p>{t('noNotificationsYet')}</p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map(notification => (
                        <div
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 relative group ${!notification.read ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                            }`}
                        >
                          <div className='flex items-start gap-3'>
                            <div className='size-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0'>
                              {notification.sender?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm text-slate-900 dark:text-white mb-1'>
                                <span className='font-semibold'>{notification.sender?.name}</span>{' '}
                                {notification.message}
                              </p>
                              {notification.discussionId?.title && (
                                <p className='text-xs text-slate-600 dark:text-slate-400 mb-1 truncate'>
                                  "{notification.discussionId.title}"
                                </p>
                              )}
                              <p className='text-xs text-slate-500 dark:text-slate-400'>
                                {getTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => deleteNotification(notification._id, e)}
                              className='opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity'
                            >
                              <X className='size-4 text-red-600 dark:text-red-400' />
                            </button>
                          </div>
                          {!notification.read && (
                            <div className='absolute left-2 top-1/2 -translate-y-1/2 size-2 bg-indigo-600 dark:bg-indigo-400 rounded-full'></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className='flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors'
            >
              <div className='size-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold'>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className='max-sm:hidden font-medium'>{user?.name}</span>
              <ChevronDown className={`size-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className='absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50'>
                {/* User Info */}
                <div className='px-4 py-3 border-b border-slate-200 dark:border-slate-700'>
                  <p className='font-semibold text-slate-900 dark:text-white'>{user?.name}</p>
                  <p className='text-sm text-slate-500 dark:text-slate-400'>{user?.email}</p>
                </div>

                {/* Menu Items */}
                <div className='py-2'>
                  <Link
                    to='/app/my-resumes'
                    onClick={() => setShowDropdown(false)}
                    className='flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors'
                  >
                    <FileText className='size-5' />
                    <span>{t('myDocuments')}</span>
                  </Link>

                  <Link
                    to='/app/resume-reviews'
                    onClick={() => setShowDropdown(false)}
                    className='flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors'
                  >
                    <Eye className='size-5' />
                    <span>{t('resumeReviews')}</span>
                  </Link>

                  <div className='my-2 border-t border-slate-200 dark:border-slate-700'></div>

                  <Link
                    to='/app/jobs/saved'
                    onClick={() => setShowDropdown(false)}
                    className='flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors'
                  >
                    <Bookmark className='size-5' />
                    <span>{t('savedJobs')}</span>
                  </Link>

                  <Link
                    to='/app/discussions/saved'
                    onClick={() => setShowDropdown(false)}
                    className='flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors'
                  >
                    <Bookmark className='size-5' />
                    <span>{t('savedDiscussions')}</span>
                  </Link>

                  <div className='my-2 border-t border-slate-200 dark:border-slate-700'></div>

                  <Link
                    to='/app/network'
                    onClick={() => setShowDropdown(false)}
                    className='flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors'
                  >
                    <Users className='size-5' />
                    <span>{t('myNetwork')}</span>
                  </Link>

                  <Link
                    to='/app/chat'
                    onClick={() => setShowDropdown(false)}
                    className='flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors'
                  >
                    <MessageSquare className='size-5' />
                    <span>{t('messages')}</span>
                  </Link>

                  <div className='my-2 border-t border-slate-200 dark:border-slate-700'></div>

                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      logoutUser()
                    }}
                    className='w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors'
                  >
                    <LogOut className='size-5' />
                    <span>{t('logout') || 'Logout'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className='md:hidden flex items-center justify-around px-4 py-2 border-t border-slate-200 dark:border-slate-700'>
        <Link
          to='/app'
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/app'
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
            : 'text-slate-600 dark:text-slate-400'
            }`}
        >
          <Home className='size-5' />
          <span className='text-xs font-medium'>{t('home')}</span>
        </Link>

        <Link
          to='/app/ats-analyzer'
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/app/ats-analyzer')
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
            : 'text-slate-600 dark:text-slate-400'
            }`}
        >
          <Target className='size-5' />
          <span className='text-xs font-medium'>{t('ats')}</span>
        </Link>

        <Link
          to='/app/jobs'
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/app/jobs')
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
            : 'text-slate-600 dark:text-slate-400'
            }`}
        >
          <Briefcase className='size-5' />
          <span className='text-xs font-medium'>{t('jobs')}</span>
        </Link>

        <Link
          to='/app/discussions'
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/app/discussions')
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
            : 'text-slate-600 dark:text-slate-400'
            }`}
        >
          <MessageSquare className='size-5' />
          <span className='text-xs font-medium'>{t('forum')}</span>
        </Link>

        <Link
          to='/app/resume-reviews'
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/app/resume-reviews')
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
            : 'text-slate-600 dark:text-slate-400'
            }`}
        >
          <Eye className='size-5' />
          <span className='text-xs font-medium'>{t('reviews')}</span>
        </Link>

        <Link
          to='/app/chat'
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive('/app/chat')
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
            : 'text-slate-600 dark:text-slate-400'
            }`}
        >
          <MessageSquare className='size-5' />
          <span className='text-xs font-medium'>{t('chat')}</span>
        </Link>
      </div>
    </div>
  )
}

export default Navbar