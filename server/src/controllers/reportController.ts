import { Request, Response } from 'express';
import * as ReportService from '../services/reportService';

export const getReport = async (req: Request, res: Response) => {
    try {
        const { surveyId } = req.params;
        const data = await ReportService.getReport(surveyId as string);
        if (!data) {
             res.status(404).json({ error: 'Report not ready or found' });
             return;
        }
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
