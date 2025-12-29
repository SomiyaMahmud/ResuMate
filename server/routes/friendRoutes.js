import express from "express";
import {
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends,
    getFriendStatus,
    getSentFriendRequests,
    cancelFriendRequest,
    removeFriend
} from "../controllers/friendControllers.js";
import protect from "../middlewares/authMiddleware.js";

const friendRouter = express.Router();

friendRouter.post("/request", protect, sendFriendRequest);
friendRouter.get("/requests", protect, getFriendRequests);
friendRouter.get("/requests/sent", protect, getSentFriendRequests);
friendRouter.post("/accept", protect, acceptFriendRequest);
friendRouter.post("/reject", protect, rejectFriendRequest);
friendRouter.post("/cancel", protect, cancelFriendRequest);
friendRouter.post("/remove", protect, removeFriend);
friendRouter.get("/", protect, getFriends);
friendRouter.get("/status/:otherUserId", protect, getFriendStatus);

export default friendRouter;
