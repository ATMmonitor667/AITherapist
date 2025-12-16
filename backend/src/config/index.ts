// Config module - Environment variables and settings

export const config = {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    falApiKey: process.env.FAL_API_KEY || process.env.FAL_KEY || '',
    port: parseInt(process.env.PORT || '4000', 10),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    isDev: process.env.NODE_ENV !== 'production'
};

export default config;
