import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, MapPin, FileText, Building2, Trash2, CheckCircle, XCircle } from 'lucide-react'
import api from '../configs/api'
import toast from 'react-hot-toast'

const Planner = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [plans, setPlans] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDayView, setShowDayView] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    time: '',
    location: '',
    notes: '',
    status: 'scheduled'
  })

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December']

  // Load plans for current month
  const loadPlans = async () => {
    try {
      const token = localStorage.getItem('token')
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const { data } = await api.get(`/api/planner/month/${year}/${month}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error loading plans:', error)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [currentDate])

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (day) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(selected)
    setShowDayView(true)
    setEditingPlan(null)
  }
  const handleAddNewInterview = () => {
    setFormData({
      companyName: '',
      position: '',
      time: '',
      location: '',
      notes: '',
      status: 'scheduled'
    })
    setEditingPlan(null)
    setShowModal(true)
  }

  const handleEditPlan = (plan) => {
    setEditingPlan(plan)
    setSelectedDate(new Date(plan.date))
    setFormData({
      companyName: plan.companyName,
      position: plan.position,
      time: plan.time,
      location: plan.location || '',
      notes: plan.notes || '',
      status: plan.status || 'scheduled'
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const planData = {
        date: selectedDate,
        ...formData
      }

      console.log('Submitting plan data:', planData)

      if (editingPlan) {
        // Update existing plan
        const { data } = await api.put(`/api/planner/${editingPlan._id}`, planData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (data.success) {
          toast.success('Plan updated successfully!')
          loadPlans()
        }
      } else {
        // Create new plan
        const { data } = await api.post('/api/planner', planData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (data.success) {
          toast.success('Plan added successfully!')
          loadPlans()
        }
      }
      setShowModal(false)
      setFormData({
        companyName: '',
        position: '',
        time: '',
        location: '',
        notes: '',
        status: 'scheduled'
      })
    } catch (error) {
      console.error('Error saving plan:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Failed to save plan')
    }
  }

  const quickUpdateStatus = async (planId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await api.put(`/api/planner/${planId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      )
      if (data.success) {
        toast.success(`Interview ${newStatus}!`)
        loadPlans()
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return
    
    try {
      const token = localStorage.getItem('token')
      const { data } = await api.delete(`/api/planner/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        toast.success('Plan deleted successfully!')
        loadPlans()
        setShowModal(false)
        setEditingPlan(null)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete plan')
    }
  }

  const handleCloseDayView = () => {
    setShowDayView(false)
    setSelectedDate(null)
  }

  const getPlansForDate = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
    return plans.filter(plan => new Date(plan.date).toDateString() === dateStr)
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate)

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold text-slate-800 flex items-center gap-2'>
            <Calendar className='text-emerald-600' />
            Interview Planner
          </h1>
          <div className='flex items-center gap-4'>
            <button onClick={handlePrevMonth} className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
              <ChevronLeft className='size-5' />
            </button>
            <h2 className='text-lg font-semibold min-w-[180px] text-center'>
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={handleNextMonth} className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
              <ChevronRight className='size-5' />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className='grid grid-cols-7 gap-2'>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className='text-center font-semibold text-slate-600 py-2'>
              {day}
            </div>
          ))}
          
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className='aspect-square' />
          ))}
          
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1
            const dayPlans = getPlansForDate(day)
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
            
            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={`aspect-square border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                  isToday ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className='flex flex-col h-full'>
                  <span className={`text-sm font-semibold ${isToday ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {day}
                  </span>
                  <div className='flex-1 overflow-hidden mt-1'>
                    {dayPlans.slice(0, 2).map((plan, idx) => {
                      const chipColors = {
                        scheduled: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
                        completed: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
                        cancelled: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                      return (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditPlan(plan)
                          }}
                          className={`text-xs rounded px-1 py-0.5 mb-1 truncate transition-colors flex items-center gap-1 ${chipColors[plan.status || 'scheduled']}`}
                        >
                          {plan.status === 'completed' && <CheckCircle size={10} />}
                          {plan.status === 'cancelled' && <XCircle size={10} />}
                          <span className={plan.status === 'cancelled' ? 'line-through' : ''}>{plan.companyName}</span>
                        </div>
                      )
                    })}
                    {dayPlans.length > 2 && (
                      <div className='text-xs text-slate-500'>+{dayPlans.length - 2} more</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day View Modal - Shows all interviews for selected date */}
      {showDayView && selectedDate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-xl'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h3 className='text-lg font-semibold flex items-center gap-2'>
                  <Calendar className='text-emerald-600' size={20} />
                  Interviews Schedule
                </h3>
                <p className='text-sm text-gray-600 mt-1'>
                  {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={handleCloseDayView} className='text-gray-400 hover:text-gray-600'>
                <X size={24} />
              </button>
            </div>

            {/* Add New Interview Button */}
            <button
              onClick={handleAddNewInterview}
              className='w-full mb-4 py-2 border-2 border-dashed border-emerald-300 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 font-medium'
            >
              <Plus size={18} />
              Add Interview
            </button>

            {/* List of interviews for this day */}
            <div className='space-y-3'>
              {getPlansForDate(selectedDate.getDate()).length === 0 ? (
                <div className='text-center py-8 text-gray-400'>
                  <Calendar size={48} className='mx-auto mb-2 opacity-50' />
                  <p>No interviews scheduled for this day</p>
                </div>
              ) : (
                getPlansForDate(selectedDate.getDate())
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((plan, idx) => {
                    const statusColors = {
                      scheduled: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                      completed: 'bg-blue-100 text-blue-700 border-blue-200',
                      cancelled: 'bg-gray-100 text-gray-600 border-gray-200'
                    }
                    return (
                      <div
                        key={idx}
                        className={`border-2 rounded-lg p-4 hover:shadow-md transition-all relative ${statusColors[plan.status || 'scheduled']}`}
                      >
                        {/* Status Badge */}
                        <div className='absolute top-2 right-2'>
                          {plan.status === 'scheduled' && (
                            <span className='bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium'>
                              Scheduled
                            </span>
                          )}
                          {plan.status === 'completed' && (
                            <span className='bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1'>
                              <CheckCircle size={12} /> Completed
                            </span>
                          )}
                          {plan.status === 'cancelled' && (
                            <span className='bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium'>
                              Cancelled
                            </span>
                          )}
                        </div>

                        <div className='pr-24'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Clock size={16} className={plan.status === 'completed' ? 'text-blue-600' : plan.status === 'cancelled' ? 'text-gray-500' : 'text-emerald-600'} />
                            <span className={`font-semibold ${plan.status === 'completed' ? 'text-blue-600' : plan.status === 'cancelled' ? 'text-gray-500' : 'text-emerald-600'}`}>{plan.time}</span>
                          </div>
                          <h4 className={`font-semibold text-lg mb-1 ${plan.status === 'cancelled' ? 'line-through text-gray-500' : 'text-gray-800'}`}>{plan.companyName}</h4>
                          <p className='text-sm text-gray-600 mb-2'>{plan.position}</p>
                          {plan.location && (
                            <div className='flex items-center gap-1 text-xs text-gray-500 mb-1'>
                              <MapPin size={12} />
                              <span>{plan.location}</span>
                            </div>
                          )}
                          {plan.notes && (
                            <p className='text-xs text-gray-500 mt-2 line-clamp-2'>{plan.notes}</p>
                          )}

                          {/* Quick Action Buttons */}
                          <div className='flex gap-2 mt-3 flex-wrap'>
                            {plan.status !== 'completed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  quickUpdateStatus(plan._id, 'completed')
                                }}
                                className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors'
                              >
                                <CheckCircle size={12} /> Mark Completed
                              </button>
                            )}
                            {plan.status !== 'cancelled' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  quickUpdateStatus(plan._id, 'cancelled')
                                }}
                                className='bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors'
                              >
                                <XCircle size={12} /> Cancel
                              </button>
                            )}
                            {plan.status !== 'scheduled' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  quickUpdateStatus(plan._id, 'scheduled')
                                }}
                                className='bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors'
                              >
                                <Calendar size={12} /> Reschedule
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditPlan(plan)
                              }}
                              className='bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors'
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeletePlan(plan._id)
                              }}
                              className='bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors'
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Interview Form Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-5 shadow-xl'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <Calendar className='text-emerald-600' size={18} />
                {editingPlan ? 'Edit Interview' : 'Add Interview'}
              </h3>
              <button onClick={() => {setShowModal(false); setEditingPlan(null)}} className='text-gray-400 hover:text-gray-600'>
                <X size={20} />
              </button>
            </div>

            <div className='mb-3 p-2 bg-emerald-50 rounded-lg'>
              <p className='text-xs font-medium text-emerald-800'>
                {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-3'>
              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1'>
                  <Building2 size={14} />
                  Company Name *
                </label>
                <input
                  type='text'
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  required
                />
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1'>
                  <FileText size={14} />
                  Position *
                </label>
                <input
                  type='text'
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  required
                />
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1'>
                  <Clock size={14} />
                  Time *
                </label>
                <input
                  type='time'
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  required
                />
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1'>
                  <MapPin size={14} />
                  Location
                </label>
                <input
                  type='text'
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  placeholder='Office address or online meeting link'
                />
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1'>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  rows={2}
                  placeholder='Additional notes...'
                />
              </div>

              <div className='flex gap-2 pt-2'>
                {editingPlan && (
                  <button
                    type='button'
                    onClick={() => handleDeletePlan(editingPlan._id)}
                    className='flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-1'
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
                <button
                  type='submit'
                  className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-sm rounded-lg font-medium transition-colors'
                >
                  {editingPlan ? 'Update Plan' : 'Add Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Planner
