/**
 * Database Seed Script
 * Run with: npm run seed
 * 
 * Compatible with supabase_setup.sql schema
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data - matching supabase_setup.sql schema
const users = [
    { id: '11111111-1111-1111-1111-111111111111', email: 'demo@echoscape.app' },
    { id: '22222222-2222-2222-2222-222222222222', email: 'test@echoscape.app' }
];

const sessions = [
    {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        user_id: '11111111-1111-1111-1111-111111111111',
        summary: 'User expressed overwhelming anxiety about work deadlines. Through reflection, they identified perfectionism as the root cause.',
        themes: ['work stress', 'perfectionism', 'deadlines'],
        primary_emotion: 'anxiety',
        emotion_data: { anxiety: 0.75, fear: 0.45, overwhelm: 0.6, hope: 0.25 },
        metaphor: 'A narrow tunnel with walls pressing in, but a soft light glimmers at the far end',
        original_image_url: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800',
        crisis_detected: false
    },
    {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        user_id: '11111111-1111-1111-1111-111111111111',
        summary: 'User shared progress recovering from a difficult breakup. They noticed moments of genuine happiness returning.',
        themes: ['relationships', 'healing', 'self-growth'],
        primary_emotion: 'hope',
        emotion_data: { hope: 0.7, sadness: 0.3, gratitude: 0.5, calm: 0.4 },
        metaphor: 'A sunrise breaking through storm clouds over a calm lake',
        original_image_url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800',
        reframed_image_url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800',
        crisis_detected: false
    },
    {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        user_id: '22222222-2222-2222-2222-222222222222',
        summary: 'User processed grief over losing a family member. They explored memories and allowed themselves to feel the loss.',
        themes: ['grief', 'loss', 'family', 'memories'],
        primary_emotion: 'sadness',
        emotion_data: { sadness: 0.8, love: 0.6, grief: 0.7, peace: 0.2 },
        metaphor: 'A misty forest path in autumn, leaves falling gently',
        original_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        crisis_detected: false
    },
    {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        user_id: '11111111-1111-1111-1111-111111111111',
        summary: 'A peaceful check-in session. User reflected on positive changes and expressed gratitude.',
        themes: ['gratitude', 'peace', 'mindfulness'],
        primary_emotion: 'calm',
        emotion_data: { calm: 0.8, gratitude: 0.7, joy: 0.5, peace: 0.75 },
        metaphor: 'A serene mountain lake at dawn, perfectly still',
        original_image_url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
        crisis_detected: false
    },
    {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        user_id: '11111111-1111-1111-1111-111111111111',
        primary_emotion: 'confusion',
        emotion_data: { confusion: 0.5, anxiety: 0.3 },
        crisis_detected: false
    }
];

// Messages use 'content' not 'text', and no sequence_number
const messages = [
    // Session 1 messages
    { session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', role: 'assistant', content: "Hi, I'm Echo. I'm here to listen and help you reflect. How are you feeling right now?" },
    { session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', role: 'user', content: "I'm really stressed about work. I have this huge deadline coming up and I feel like I'm going to fail.", emotion_snapshot: { anxiety: 0.8, fear: 0.6 } },
    { session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', role: 'assistant', content: "That sounds really overwhelming. The pressure of deadlines can feel crushing. What specifically about this deadline is making you feel like you might fail?" },
    { session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', role: 'user', content: "I guess I feel like nothing I do is ever good enough. Even when I work hard, I find flaws in everything.", emotion_snapshot: { anxiety: 0.7, sadness: 0.4 } },
    
    // Session 2 messages
    { session_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', role: 'assistant', content: "Hi, I'm Echo. I'm here to listen and help you reflect. How are you feeling right now?" },
    { session_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', role: 'user', content: "Actually, I'm feeling pretty good today. For the first time in a while, I woke up and didn't feel that heaviness.", emotion_snapshot: { hope: 0.6, joy: 0.4 } },
    { session_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', role: 'assistant', content: "That's wonderful to hear. Those moments of lightness can be so precious. What do you think contributed to this feeling?" },
    
    // Session 3 messages
    { session_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', role: 'assistant', content: "Hi, I'm Echo. I'm here to listen and help you reflect. How are you feeling right now?" },
    { session_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', role: 'user', content: "My grandmother passed away last month. I thought I was handling it okay, but today I found her old recipe book and I just broke down.", emotion_snapshot: { sadness: 0.9, grief: 0.8, love: 0.7 } },
    { session_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', role: 'assistant', content: "I'm so sorry for your loss. Grief has a way of finding us in unexpected moments, especially through objects that hold memories." },
    
    // Session 4 messages
    { session_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', role: 'assistant', content: "Hi, I'm Echo. I'm here to listen and help you reflect. How are you feeling right now?" },
    { session_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', role: 'user', content: "Honestly? Pretty peaceful. I just wanted to check in and reflect on how far I've come.", emotion_snapshot: { calm: 0.8, gratitude: 0.7 } },
    
    // Session 5 messages (active)
    { session_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', role: 'assistant', content: "Hi, I'm Echo. I'm here to listen and help you reflect. How are you feeling right now?" },
    { session_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', role: 'user', content: "I'm not sure how I feel today. Kind of all over the place.", emotion_snapshot: { confusion: 0.6, anxiety: 0.3 } }
];

const analytics = [
    { session_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', emotion_vector: { anxiety: 0.75, fear: 0.45, overwhelm: 0.6 }, cognitive_patterns: ['catastrophizing', 'all-or-nothing thinking'] },
    { session_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', emotion_vector: { hope: 0.7, sadness: 0.3, gratitude: 0.5 }, cognitive_patterns: [] },
    { session_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', emotion_vector: { sadness: 0.8, love: 0.6, grief: 0.7 }, cognitive_patterns: [] },
    { session_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', emotion_vector: { calm: 0.8, gratitude: 0.7, joy: 0.5 }, cognitive_patterns: [] }
];

async function seed() {
    console.log('🌱 Starting database seed...\n');

    try {
        // 1. Insert Users
        console.log('👤 Inserting users...');
        const { error: usersError } = await supabase
            .from('users')
            .upsert(users, { onConflict: 'id' });
        if (usersError) throw usersError;
        console.log(`   ✅ ${users.length} users inserted\n`);

        // 2. Insert Sessions
        console.log('📝 Inserting sessions...');
        const { error: sessionsError } = await supabase
            .from('sessions')
            .upsert(sessions, { onConflict: 'id' });
        if (sessionsError) throw sessionsError;
        console.log(`   ✅ ${sessions.length} sessions inserted\n`);

        // 3. Insert Messages
        console.log('💬 Inserting messages...');
        const { error: messagesError } = await supabase
            .from('messages')
            .insert(messages);
        if (messagesError && !messagesError.message?.includes('duplicate')) throw messagesError;
        console.log(`   ✅ ${messages.length} messages inserted\n`);

        // 4. Insert Analytics
        console.log('📊 Inserting analytics...');
        const { error: analyticsError } = await supabase
            .from('session_analytics')
            .insert(analytics);
        if (analyticsError && !analyticsError.message?.includes('duplicate')) throw analyticsError;
        console.log(`   ✅ ${analytics.length} analytics records inserted\n`);

        // 5. Verify
        console.log('📊 Verifying data...');
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: sessionCount } = await supabase.from('sessions').select('*', { count: 'exact', head: true });
        const { count: messageCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });
        const { count: analyticsCount } = await supabase.from('session_analytics').select('*', { count: 'exact', head: true });

        console.log(`
┌─────────────────────────────────┐
│      DATABASE SEED COMPLETE     │
├─────────────────────────────────┤
│  Users:      ${String(userCount).padStart(3)}               │
│  Sessions:   ${String(sessionCount).padStart(3)}               │
│  Messages:   ${String(messageCount).padStart(3)}               │
│  Analytics:  ${String(analyticsCount).padStart(3)}               │
└─────────────────────────────────┘
        `);

        console.log('✅ Database seeded successfully!\n');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();
