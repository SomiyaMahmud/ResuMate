import express from 'express'
import protect from '../middlewares/authMiddleware.js'
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../controllers/notificationControllers.js'

const notificationRouter = express.Router()

notificationRouter.get('/', protect, getNotifications)
notificationRouter.put('/:notificationId/read', protect, markAsRead)
notificationRouter.put('/read-all', protect, markAllAsRead)
notificationRouter.delete('/:notificationId', protect, deleteNotification)

export default notificationRouter
