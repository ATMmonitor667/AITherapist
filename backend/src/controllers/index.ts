// Controller exports - use selective exports to avoid conflicts
export { analyzeJournal } from './analyzer.controller';
export { 
    startSession, 
    sendMessage, 
    getHistory as getConversationHistory, 
    endSession, 
    listSessions 
} from './conversation.controller';
export { generateBaseImage, reframeSession } from './generate.controller';
export { getHistory, getSession } from './history.controller';
export { sessionController } from './session.controller';
export { visualController } from './visual.controller';

// Named exports for route usage
import * as historyController from './history.controller';
export { historyController };
