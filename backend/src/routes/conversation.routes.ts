// Conversation Routes

import { Router } from "express";
import {
    startSession,
    sendMessage,
    getHistory,
    endSession,
    listSessions
} from "../controllers/conversation.controller";

const router = Router();

// /api/session/...
router.get("/", listSessions);
router.post("/start", startSession);
router.post("/:id/message", sendMessage);
router.get("/:id/history", getHistory);
router.post("/:id/end", endSession);

export default router;
