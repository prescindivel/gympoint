import * as Yup from 'yup';
import { startOfDay, endOfDay, parseISO, isBefore, addMonths } from 'date-fns';

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

    const { start_date, student_id, plan_id } = req.body;

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

    const enrollment = await Enrollment.findByPk(req.params.enrollment_id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exists.' });
    }

    const { start_date, plan_id } = req.body;

    const plan = plan_id
      ? await Plan.findByPk(plan_id)
      : await Plan.findByPk(enrollment.plan_id);

    if (plan_id && !plan) {
      return res.status(400).json({ error: 'Plan does not exists.' });
    }

    const startDate = start_date
      ? startOfDay(parseISO(start_date))
      : startOfDay(enrollment.start_date);

    if (isBefore(endOfDay(startDate), new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted.' });
    }

    const end_date = addMonths(startDate, plan.duration);

    const price = plan.price * plan.duration;

    await enrollment.update({
      plan_id: plan.id,
      price,
      start_date: startDate.toISOString(),
      end_date
    });

    return res.json(enrollment);
  }

  async delete(req, res) {
    const checkIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true }
    });

    if (!checkIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only users admins can delete enrollment.' });
    }

    const enrollment = await Enrollment.findByPk(req.params.enrollment_id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exists.' });
    }

    await enrollment.destroy();

    return res.send();
  }
}

export default new EnrollmentController();
