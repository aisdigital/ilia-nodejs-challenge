interface ListCall {
  request: {
    page: number;
    limit: number;
    offset: number;
    receiving_user_id?: string;
    paying_user_id?: string;
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

    return callback(null, { 
      results: [{ _id: 'test', price: 123, type: 'debit', paying_user_id: 'test', receiving_user_id: 'test2' }],
      page: 0, limit: 20, totalCount: 10,
    })
  }
}