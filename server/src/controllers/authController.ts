import { Request, Response } from 'express';
import * as AuthService from '../services/authService';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const data = await AuthService.login(email, password);

        res.cookie('token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ user: data.user });
    } catch (e: any) {
        res.status(401).json({ error: e.message });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};

export const me = (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user) {
        res.json({ user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
};
