import * as Yup from 'yup';

import User from '../models/User';
import Plan from '../models/Plan';

class PlanController {
  async list(req, res) {
    const checkIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true }
    });

    if (!checkIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only users admins can list plans.' });
    }

    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
      order: ['id']
    });

    return res.json(plans);
  }

  async create(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required()
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
        .json({ error: 'Only users admins can create plans.' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({ id, title, duration, price });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number()
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
        .json({ error: 'Only users admins can update plans.' });
    }

    const plan = await Plan.findByPk(req.params.plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists.' });
    }

    const { id, title, duration, price } = await plan.update(req.body);

    return res.json({ id, title, duration, price });
  }

  async delete(req, res) {
    const checkIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true }
    });

    if (!checkIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only users admins can delete plans.' });
    }

    const plan = await Plan.findByPk(req.params.plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists.' });
    }

    await plan.destroy();

    return res.send();
  }
}

export default new PlanController();
