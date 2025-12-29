import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

export const sendFriendRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const senderId = req.userId;

        console.log('Friend Request Attempt:', { senderId, recipientId });

        if (!recipientId) {
            return res.status(400).json({ message: "Recipient ID is required" });
        }

        if (senderId === recipientId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: senderId, recipient: recipientId },
                { sender: recipientId, recipient: senderId }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already exists or you are already friends" });
        }

        const sender = await User.findById(senderId);
        if (sender.friends && sender.friends.includes(recipientId)) {
            return res.status(400).json({ message: "You are already friends" });
        }

        const newRequest = await FriendRequest.create({
            sender: senderId,
            recipient: recipientId
        });

        res.status(201).json({ message: "Friend request sent", request: newRequest });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.userId;
        const requests = await FriendRequest.find({ recipient: userId, status: "pending" })
            .populate("sender", "name email");
        res.status(200).json({ requests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const userId = req.userId;

        const request = await FriendRequest.findById(requestId);
        if (!request || request.recipient.toString() !== userId) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        request.status = "accepted";
        await request.save();

        // Add to each other's friends list
        await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.recipient } });
        await User.findByIdAndUpdate(request.recipient, { $addToSet: { friends: request.sender } });

        // Optionally delete the request record or keep it with status accepted
        // For now, let's keep it.

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const userId = req.userId;

        const request = await FriendRequest.findById(requestId);
        if (!request || request.recipient.toString() !== userId) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        request.status = "rejected";
        await request.save();

        // Or just delete it
        // await request.deleteOne();

        res.status(200).json({ message: "Friend request rejected" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFriends = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).populate("friends", "name email");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log(`Fetching friends for user ${userId}:`, user.friends?.length || 0);
        res.status(200).json({ friends: user.friends || [] });
    } catch (error) {
        console.error('getFriends error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getFriendStatus = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (user.friends && user.friends.includes(otherUserId)) {
            return res.status(200).json({ status: 'friends' });
        }

        const outgoingRequest = await FriendRequest.findOne({ sender: userId, recipient: otherUserId, status: 'pending' });
        if (outgoingRequest) {
            return res.status(200).json({ status: 'request_sent' });
        }

        const incomingRequest = await FriendRequest.findOne({ sender: otherUserId, recipient: userId, status: 'pending' });
        if (incomingRequest) {
            return res.status(200).json({ status: 'request_received' });
        }

        res.status(200).json({ status: 'none' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSentFriendRequests = async (req, res) => {
    try {
        const userId = req.userId;
        const requests = await FriendRequest.find({ sender: userId, status: "pending" })
            .populate("recipient", "name email");
        res.status(200).json({ requests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const cancelFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const userId = req.userId;

        const request = await FriendRequest.findById(requestId);
        if (!request || request.sender.toString() !== userId) {
            return res.status(404).json({ message: "Friend request not found or unauthorized" });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: "Cannot cancel a request that is not pending" });
        }

        await request.deleteOne();
        res.status(200).json({ message: "Friend request cancelled" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFriend = async (req, res) => {
    try {
        const { friendId } = req.body;
        const userId = req.userId;

        await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
        await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

        // Optionally clean up the request record
        await FriendRequest.deleteOne({
            $or: [
                { sender: userId, recipient: friendId },
                { sender: friendId, recipient: userId }
            ],
            status: "accepted"
        });

        res.status(200).json({ message: "Friend removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
