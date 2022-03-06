import { celebrate, Joi } from 'celebrate';

const createTransactionValidator = celebrate({
  body: Joi.object().keys({
    user_id: Joi.string()
      .required()
      .error(new Error('user_id é um campo obrigatório do tipo string.')),
    amount: Joi.number()
      .required()
      .error(new Error('amount é um campo obrigatório do tipo number.')),
    type: Joi.string()
      .required()
      .valid('CREDIT', 'DEBIT')
      .error(
        new Error(
          'type é um campo obrigatório do tipo string sendo CREDIT ou DEBIT.',
        ),
      ),
  }),
});

export default createTransactionValidator;
