import { Router } from 'express';
import * as SurveyController from '../controllers/surveyController';
import * as ResponseController from '../controllers/responseController';
import * as ReportController from '../controllers/reportController';
import * as AuthController from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();




router.post('/login', AuthController.login);


router.get('/surveys/:id', SurveyController.getSurvey);
router.post('/responses', ResponseController.submitResponse);



router.post('/logout', authMiddleware, AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);


router.get('/metadata', authMiddleware, SurveyController.getMetadata);
router.get('/surveys', authMiddleware, SurveyController.listSurveys);
router.post('/surveys', authMiddleware, SurveyController.createSurvey);
router.patch('/surveys/:id/status', authMiddleware, SurveyController.updateSurveyStatus);


router.get('/reports/:surveyId', authMiddleware, ReportController.getReport);

export default router;
