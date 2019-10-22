import * as Yup from 'yup';
import { endOfDay, parseISO, isBefore, addMonths } from 'date-fns';

import WelcomeMail from '../jobs/WelcomeMail';
import Queue from '../../lib/Queue';

import User from '../models/User';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Enrollment from '../models/Enrollment';

class EnrollmentController {
  async list(req, res) {
    const checkIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true }
    });

    if (!checkIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only users admins can list enrollments.' });
    }

    const { page = 1 } = req.query;

    const enrollments = await Enrollment.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'weight', 'height']
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price']
        }
      ]
    });

    return res.json(enrollments);
  }

  async create(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      student_id: Yup.number().required(),
      plan_id: Yup.number().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const checkIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true }
    });

    if (!checkIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only users admins can create enrollment.' });
    }

    const { start_date, student_id, plan_id } = await req.body;

    const checkEnrollmentExists = await Enrollment.findOne({
      where: { student_id }
    });

    if (checkEnrollmentExists) {
      return res.status(400).json({ error: 'Student already enrolled.' });
    }

    const student = await Student.findByPk(student_id);
    const plan = await Plan.findByPk(plan_id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found.' });
    }

    const startDate = endOfDay(parseISO(start_date));

    if (isBefore(startDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted.' });
    }

    const end_date = addMonths(startDate, plan.duration);

    const price = plan.price * plan.duration;

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price
    });

    await Queue.add(WelcomeMail.key, {
      enrollment,
      student,
      plan
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      student_id: Yup.number(),
      plan_id: Yup.number()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const checkIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true }
    });

    if (!checkIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only users admins can update enrollment.' });
    }

    return res.json({ ok: 'ok' });
  }
}

export default new EnrollmentController();
