import { celebrate, Joi } from 'celebrate';

const findTransactionValidator = celebrate({
  query: Joi.object().keys({
    type: Joi.string()
      .optional()
      .valid('CREDIT', 'DEBIT')
      .error(new Error('type deve ser do tipo string sendo CREDIT ou DEBIT.')),
  }),
});

export default findTransactionValidator;
