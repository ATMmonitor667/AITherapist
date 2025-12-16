// Core service exports
export * from './conversation.service';
export * from './crisis.service';
export * from './emotion.service';
export * from './fibo.service';
export * from './gemini.service';  // Available but not actively used
export * from './openai.service';  // Currently active
export * from './ml.service';
export * from './session.service';

// Object-based service exports for controllers
export { analyticsService } from './analytics.service';
export { sessionService } from './session-wrapper.service';
export { visualService } from './visual.service';

// Re-export conversation service functions as object
import * as conversationFns from './conversation.service';
import { detectCrisis } from './crisis.service';

export const conversationService = {
  ...conversationFns,

  checkCrisis: (text: string) => {
    const result = detectCrisis(text);
    return { isCrisis: result.isCrisis, keywords: result.detectedKeywords };
  },

  generateResponse: async (text: string, messages: Array<{ session_id?: string; content?: string }>) => {
    return conversationFns.generateAIResponse(messages[0]?.session_id || '', text);
  },

  getCrisisResponse: () => {
    return "I hear how much pain you're in, and I want you to be safe. Please reach out to a professional or a crisis support line right away. You don't have to carry this alone.\n\n📞 National Suicide Prevention Lifeline: 988\n📱 Crisis Text Line: Text HOME to 741741\n🌍 International: findahelpline.com";
  },

  generateSummary: async (messages: Array<{ content?: string; text?: string }>) => {
    const messageCount = messages.length;
    const themes: string[] = [];
    const content = messages.map((m) => m.content || m.text || '').join(' ').toLowerCase();

    if (content.includes('work') || content.includes('job')) themes.push('work');
    if (content.includes('family') || content.includes('parent')) themes.push('family');
    if (content.includes('stress') || content.includes('anxious')) themes.push('stress');
    if (content.includes('happy') || content.includes('joy')) themes.push('positive emotions');
    if (content.includes('sad') || content.includes('down')) themes.push('difficult emotions');

    return {
      summary: `Session with ${messageCount} messages exploring personal thoughts and feelings.`,
      themes: themes.length > 0 ? themes : ['reflection'],
      metaphor: "A moment of introspection",
      cognitive_patterns: []
    };
  }
};
