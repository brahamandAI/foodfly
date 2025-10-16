import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurantSettings extends Document {
  restaurantId: string;
  restaurantName: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  deliveryRadius: number;
  minOrderAmount: number;
  notifications: {
    newOrders: boolean;
    orderUpdates: boolean;
    emailNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSettingsSchema: Schema = new Schema({
  restaurantId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  restaurantName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  openingHours: {
    type: String,
    default: '9:00 AM - 11:00 PM'
  },
  deliveryRadius: {
    type: Number,
    default: 5,
    min: 1,
    max: 50
  },
  minOrderAmount: {
    type: Number,
    default: 200,
    min: 0
  },
  notifications: {
    newOrders: {
      type: Boolean,
      default: true
    },
    orderUpdates: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Create indexes for better performance
RestaurantSettingsSchema.index({ restaurantId: 1 });
RestaurantSettingsSchema.index({ email: 1 });

export default mongoose.models.RestaurantSettings || mongoose.model<IRestaurantSettings>('RestaurantSettings', RestaurantSettingsSchema);
