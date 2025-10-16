import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurantAdmin extends Document {
  email: string;
  username: string;
  password: string;
  restaurantId: string;
  restaurantName: string;
  adminName: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantAdminSchema = new Schema<IRestaurantAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    restaurantId: {
      type: String,
      required: true
    },
    restaurantName: {
      type: String,
      required: true
    },
    adminName: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'restaurant_admin'
    }
  },
  {
    timestamps: true
  }
);

// Create indexes
RestaurantAdminSchema.index({ email: 1 });
RestaurantAdminSchema.index({ username: 1 });
RestaurantAdminSchema.index({ restaurantId: 1 });

const RestaurantAdmin = mongoose.models.RestaurantAdmin || mongoose.model<IRestaurantAdmin>('RestaurantAdmin', RestaurantAdminSchema);

export default RestaurantAdmin;
