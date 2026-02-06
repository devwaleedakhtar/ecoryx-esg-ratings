import { Request, Response } from 'express';
import * as ResponseService from '../services/responseService';

export const submitResponse = async (req: Request, res: Response) => {
    try {
        const { surveyId, groupId, ratings } = req.body;
        const data = await ResponseService.submitResponse(surveyId, groupId, ratings);
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
