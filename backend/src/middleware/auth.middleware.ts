import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY! // Use Service Key for admin tasks, or Anon for verification
);

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    console.log('[Auth Middleware] Authorization header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader) {
        console.log('[Auth Middleware] No authorization header');
        return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    console.log('[Auth Middleware] Token extracted:', token ? 'Yes' : 'No');

    const { data: { user }, error } = await supabase.auth.getUser(token);

    console.log('[Auth Middleware] Verification result:', {
        user: user?.email || 'None',
        error: error?.message || 'None'
    });

    if (error || !user) {
        console.log('[Auth Middleware] Invalid token or user not found');
        return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('[Auth Middleware] Auth successful for:', user.email);

    // Attach user to request
    (req as any).user = user;
    next();
};
