import { TransactionModel } from "./models/transaction";
import { TransactionType } from "./types";

interface ListCall {
  request: {
    page: number;
    limit: number;
    offset: number;
    receiving_user_id?: string;
    paying_user_id?: string;
  }
}

interface CreateCall {
  request: {
    price: number;
    type: TransactionType;
    receiving_user_id: string;
    paying_user_id: string;
  }
}

type Callback = (param1: null, param2: any) => void

export const transactionRoutes = {
  list: async (call: ListCall, callback: Callback) => {
    const { page, limit, offset, receiving_user_id, paying_user_id } = call.request

    let findOptions = {}

    if(receiving_user_id) {
      findOptions = Object.assign(findOptions, { receiving_user_id })
    }

    if(paying_user_id) {
      findOptions = Object.assign(findOptions, { paying_user_id })
    }

    const transactions = await TransactionModel
      .find(findOptions)
      .populate({ path: 'receiving_user_id', select: '_id email name' })
      .populate({ path: 'paying_user_id', select: '_id email name' })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(Number(limit))

    const totalCount = await TransactionModel.countDocuments(findOptions)

    return callback(null, { 
      results: transactions,
      page: Number(page),
      limit: Number(limit),
      totalCount,
    })
  },
  create: async (call: CreateCall, callback: Callback) => {
    const { price, type, receiving_user_id, paying_user_id } = call.request

    const transaction = await TransactionModel.create({
      price,
      type,
      receiving_user_id,
      paying_user_id
    })

    return callback(null, {transaction: transaction.serialize() })
  }
}