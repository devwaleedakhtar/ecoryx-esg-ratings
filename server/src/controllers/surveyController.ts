import { Request, Response } from 'express';
import * as SurveyService from '../services/surveyService';
import * as ReportService from '../services/reportService';

export const listSurveys = async (req: Request, res: Response) => {
    try {
        const data = await SurveyService.getAllSurveys();
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getSurvey = async (req: Request, res: Response) => {
    try {
        const data = await SurveyService.getSurveyById(req.params.id as string);
        if (!data) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const createSurvey = async (req: Request, res: Response) => {
    try {
        const { title, kpis, groups } = req.body;
        const data = await SurveyService.createSurvey(title, kpis, groups);
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getMetadata = async (req: Request, res: Response) => {
    try {
        const data = await SurveyService.getMetadata();
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const updateSurveyStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const data = await SurveyService.updateStatus(id as string, status);

        if (status === 'COMPLETED') {
            console.log(`Survey ${id} completed. Generating AI Report...`);
            try {
                await ReportService.generateReport(id as string);
                console.log(`Report generated for survey ${id}`);
            } catch (reportErr: any) {
                console.error("Report Generation Failed:", reportErr.message);
            }
        }

        res.json(data);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
