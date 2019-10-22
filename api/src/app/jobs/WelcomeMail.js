import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Mail from '../../lib/Mail';

class WelcomeMail {
  get key() {
    return 'WelcomeMail';
  }

  async handle({ data }) {
    const { enrollment, student, plan } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matricula realizada!',
      template: 'welcome',
      context: {
        student,
        plan,
        start_date: format(
          parseISO(enrollment.start_date),
          "'dia' dd 'de' MMMM',' yyyy",
          {
            locale: ptBR
          }
        ),
        end_date: format(
          parseISO(enrollment.end_date),
          "'dia' dd 'de' MMMM',' yyyy",
          {
            locale: ptBR
          }
        )
      }
    });
  }
}

export default new WelcomeMail();
