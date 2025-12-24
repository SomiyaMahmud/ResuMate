import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { createPlan, getAllPlans, getPlansByMonth, updatePlan, deletePlan } from '../controllers/plannerControllers.js';

const plannerRouter = express.Router();

// All routes are protected
plannerRouter.post('/', protect, createPlan);
plannerRouter.get('/', protect, getAllPlans);
plannerRouter.get('/month/:year/:month', protect, getPlansByMonth);
plannerRouter.put('/:planId', protect, updatePlan);
plannerRouter.delete('/:planId', protect, deletePlan);

export default plannerRouter;
