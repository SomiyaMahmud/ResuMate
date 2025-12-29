import Message from "../models/Message.js";
import User from "../models/User.js";

export const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.userId;

        // Verify they are friends
        const sender = await User.findById(senderId);
        if (!sender.friends.includes(recipientId)) {
            return res.status(403).json({ message: "You can only message your friends" });
        }

        const newMessage = await Message.create({
            sender: senderId,
            recipient: recipientId,
            content
        });

        res.status(201).json({ message: "Message sent", data: newMessage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const userId = req.userId;

        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: otherUserId },
                { sender: otherUserId, recipient: userId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRecentChats = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        // Find all unique users the current user has exchanged messages with
        const messages = await Message.find({
            $or: [{ sender: userId }, { recipient: userId }]
        }).sort({ createdAt: -1 });

        const chatUserIds = new Set();
        messages.forEach(msg => {
            if (msg.sender && msg.sender.toString() !== userId.toString()) {
                chatUserIds.add(msg.sender.toString());
            }
            if (msg.recipient && msg.recipient.toString() !== userId.toString()) {
                chatUserIds.add(msg.recipient.toString());
            }
        });

        const users = await User.find({ _id: { $in: Array.from(chatUserIds) } }, "name email");

        console.log(`Recent chats for ${userId}:`, users.length);
        res.status(200).json({ chats: users });
    } catch (error) {
        console.error('getRecentChats error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const editMessage = async (req, res) => {
    try {
        const { messageId, content } = req.body;
        const userId = req.userId;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        message.content = content;
        message.isEdited = true;
        await message.save();

        res.status(200).json({ message: "Message updated", data: message });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.userId;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await message.deleteOne();

        res.status(200).json({ message: "Message deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
