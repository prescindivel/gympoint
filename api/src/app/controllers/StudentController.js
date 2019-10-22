import * as Yup from 'yup';

import User from '../models/User';
import Student from '../models/Student';

class StudentController {
  async list(req, res) {
    const checkIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true }
    });

    if (!checkIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only users admins can list students.' });
    }

    const { page = 1 } = req.query;

    const students = await Student.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height']
    });

    return res.json(students);
  }

  async create(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required()
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
        .json({ error: 'Only users admins can create student.' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email }
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists.' });
    }

    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number(),
      weight: Yup.number(),
      height: Yup.number()
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
        .json({ error: 'Only users admins can update student.' });
    }

    const { student_id } = req.params;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists.' });
    }

    const { id, name, email, age, weight, height } = await student.update(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }
}

export default new StudentController();
