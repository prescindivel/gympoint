import * as Yup from 'yup';

import AnswerMail from '../jobs/AnswerMail';
import Queue from '../../lib/Queue';

import HelpOrder from '../models/HelpOrder';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';

class HelpOrderController {
  async list(req, res) {
    const { page = 1 } = req.query;

    const helpOrders = await HelpOrder.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'question', 'answer', 'answer_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'weight', 'height']
        }
      ]
    });

    return res.json(helpOrders);
  }

  async create(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const { student_id } = req.params;

    const checkEnrollmentExists = await Enrollment.findOne({
      where: { student_id }
    });

    if (!checkEnrollmentExists) {
      return res.status(400).json({ error: 'Student not enrolled.' });
    }

    const { id, question, student_id: student } = await HelpOrder.create({
      question: req.body.question,
      student_id
    });

    return res.json({ id, question, student_id: student });
  }

  async answer(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const helpOrder = await HelpOrder.findOne({
      where: { id: req.params.help_order_id, answer: null },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'weight', 'height']
        }
      ]
    });

    if (!helpOrder) {
      return res.status(400).json({ error: 'Question already answered.' });
    }

    const { id, question, answer, answer_at, student } = await helpOrder.update(
      {
        answer: req.body.answer,
        answer_at: new Date()
      }
    );

    await Queue.add(AnswerMail.key, {
      helpOrder,
      student
    });

    return res.json({
      id,
      question,
      answer,
      answer_at,
      student
    });
  }
}

export default new HelpOrderController();
