import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Mail from '../../lib/Mail';

class AnswerMail {
  get key() {
    return 'AnswerMail';
  }

  async handle({ data }) {
    const { student, helpOrder } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Sua pergunta foi respondida!',
      template: 'answer',
      context: {
        student,
        helpOrder,
        answer_at: format(
          parseISO(helpOrder.answer_at),
          "'dia' dd 'de' MMMM',' yyyy",
          {
            locale: ptBR
          }
        )
      }
    });
  }
}

export default new AnswerMail();
