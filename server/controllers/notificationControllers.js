import Notification from "../models/Notification.js"

// Get user notifications
// GET: /api/notifications
export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId
        const { limit = 20 } = req.query

        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'name email')
            .populate('discussionId', 'title')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))

        const unreadCount = await Notification.countDocuments({ 
            recipient: userId, 
            read: false 
        })

        return res.status(200).json({
            notifications,
            unreadCount
        })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Mark notification as read
// PUT: /api/notifications/:notificationId/read
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params
        const userId = req.userId

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { read: true },
            { new: true }
        )

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" })
        }

        return res.status(200).json({ notification })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Mark all notifications as read
// PUT: /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId

        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        )

        return res.status(200).json({ message: "All notifications marked as read" })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Delete notification
// DELETE: /api/notifications/:notificationId
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params
        const userId = req.userId

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userId
        })

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" })
        }

        return res.status(200).json({ message: "Notification deleted" })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// Helper function to create notification

export const createNotification = async (recipientId, senderId, type, discussionId, commentId, message) => {
    try {
        // Don't notify if sender and recipient are the same
        if (recipientId.toString() === senderId.toString()) {
            console.log('⚠️ Skipping self-notification')
            return null
        }

        console.log('Creating notification:', {
            recipient: recipientId.toString(),
            sender: senderId.toString(),
            type,
            discussionId: discussionId.toString(),
            message
        })

        const notification = await Notification.create({
            recipient: recipientId,
            sender: senderId,
            type,
            discussionId,
            commentId,
            message
        })

        console.log('Notification created successfully:', notification._id)

        return notification
    } catch (error) {
        console.error('Error creating notification:', error)
        return null
    }
}
