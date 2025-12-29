import express from "express";
import {
    sendMessage,
    getMessages,
    getRecentChats,
    editMessage,
    deleteMessage
} from "../controllers/chatControllers.js";
import protect from "../middlewares/authMiddleware.js";

const chatRouter = express.Router();

chatRouter.post("/send", protect, sendMessage);
chatRouter.get("/messages/:otherUserId", protect, getMessages);
chatRouter.get("/recent", protect, getRecentChats);
chatRouter.put("/edit", protect, editMessage);
chatRouter.delete("/delete/:messageId", protect, deleteMessage);

export default chatRouter;
