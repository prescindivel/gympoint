import { startOfDay, endOfDay, subDays } from 'date-fns';
import { Op } from 'sequelize';

import Student from '../models/Student';
import Checkin from '../models/Checkin';
import Enrollment from '../models/Enrollment';

class CheckinController {
  async list(req, res) {
    const { student_id } = req.params;

    const { page = 1 } = req.query;

    const checkEnrollmentExists = await Enrollment.findOne({
      where: { student_id }
    });

    if (!checkEnrollmentExists) {
      return res.status(400).json({ error: 'Student not enrolled.' });
    }

    const checkins = await Checkin.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      where: {
        student_id
      }
    });

    return res.json(checkins);
  }

  async create(req, res) {
    const { student_id } = req.params;

    const checkEnrollmentExists = await Enrollment.findOne({
      where: { student_id }
    });

    if (!checkEnrollmentExists) {
      return res.status(400).json({ error: 'Student not enrolled.' });
    }

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    const today = endOfDay(new Date());
    const last7Days = subDays(startOfDay(today), 7);

    const checkins = await Checkin.findAll({
      where: {
        student_id,
        created_at: {
          [Op.between]: [last7Days, today]
        }
      }
    });

    if (checkins.length === 5) {
      return res
        .status(401)
        .json({ error: 'You can only do 5 checkins within 7 days.' });
    }

    const checkin = await Checkin.create({ student_id });

    return res.json(checkin);
  }
}

export default new CheckinController();
