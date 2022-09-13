import mongoose, { Schema } from 'mongoose'
import { SerializedUser, User } from '../types'

const userSchema = new Schema<User>(
  {
    email: {
      required: true,
      type: String,
    },
    name: {
      required: true,
      type: String,
    }
  },
  { timestamps: true }
)

userSchema.methods.serialize = function(): SerializedUser {
  return {
    _id: this._id,
    email: this.email,
    name: this.name,
  }
}

const UserModel = mongoose.model<User>('User', userSchema)
export { UserModel }