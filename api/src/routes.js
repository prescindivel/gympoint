import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';

const routes = new Router();

routes.post('/users', UserController.create);
routes.post('/sessions', SessionController.create);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/students', StudentController.create);
routes.put('/students/:student_id', StudentController.update);

routes.get('/plans', PlanController.list);
routes.post('/plans', PlanController.create);
routes.put('/plans/:plan_id', PlanController.update);
routes.delete('/plans/:plan_id', PlanController.delete);

routes.get('/enrollments', EnrollmentController.list);
routes.post('/enrollments', EnrollmentController.create);
routes.put('/enrollments/:enrollment_id', EnrollmentController.update);

export default routes;
