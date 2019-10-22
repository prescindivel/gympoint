import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import CheckinController from './app/controllers/CheckinController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';

const routes = new Router();

routes.post('/users', UserController.create);
routes.post('/sessions', SessionController.create);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/students', StudentController.list);
routes.post('/students', StudentController.create);
routes.put('/students/:student_id', StudentController.update);
routes.delete('/students/:student_id', StudentController.delete);

routes.get('/students/:student_id/checkins', CheckinController.list);
routes.post('/students/:student_id/checkins', CheckinController.create);

routes.get('/plans', PlanController.list);
routes.post('/plans', PlanController.create);
routes.put('/plans/:plan_id', PlanController.update);
routes.delete('/plans/:plan_id', PlanController.delete);

routes.get('/enrollments', EnrollmentController.list);
routes.post('/enrollments', EnrollmentController.create);
routes.put('/enrollments/:enrollment_id', EnrollmentController.update);
routes.delete('/enrollments/:enrollment_id', EnrollmentController.delete);

export default routes;
