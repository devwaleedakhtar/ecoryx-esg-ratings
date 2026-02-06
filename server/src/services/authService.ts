import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/config';

export const login = async (email: string, pass: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    return { token, user: { email: user.email, role: user.role } };
};

export const register = async (email: string, pass: string) => {
    const hashed = await bcrypt.hash(pass, 10);
    return prisma.user.create({
        data: { email, password: hashed }
    });
};
