import mongoose, { Schema, Document } from 'mongoose';
import uuid4 from 'uuid4';
import { User } from '../../user/models/User';

export interface RefreshToken extends Document {
  _id: string;
  token: string;
  expiration_date: string;
  expired: boolean;
  user_id: User;
}

const RefreshTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v): boolean {
          return uuid4.valid(v);
        },
        message: (props: { value: string }): string => `${props.value} is a not a valid token`,
      },
    },
    expiration_date: {
      type: Date,
      default: Date.now() + 15 * 60 * 1000,
    },
    expired: { type: Boolean, default: false },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<RefreshToken>('RefreshToken', RefreshTokenSchema);
