import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  rating?: number;
  preparationTime?: string;
  image: string;
  isAvailable: boolean;
  type: 'VEG' | 'NON-VEG';
  variantPrices?: Array<{
    variant: string;
    price: number;
  }>;
  customizations?: string[];
  createdAt: Date;
  updatedAt: Date;
  isAdminCustomized?: boolean; // Flag to indicate admin has customized this item
  adminImageUrl?: string; // Admin-uploaded image URL
  lastImageSourceUrl?: string; // Original provider URL for regeneration avoidance
}

const MenuItemSchema: Schema = new Schema({
  _id: {
    type: String,
    required: true
  },
  restaurantId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  isVeg: {
    type: Boolean,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  preparationTime: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['VEG', 'NON-VEG'],
    required: true
  },
  variantPrices: [{
    variant: String,
    price: Number
  }],
  customizations: [String],
  isAdminCustomized: {
    type: Boolean,
    default: false
  },
  adminImageUrl: {
    type: String,
    default: ''
  },
  lastImageSourceUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  _id: false // We're using custom _id
});

// Create compound indexes for better query performance
MenuItemSchema.index({ restaurantId: 1, category: 1 });
MenuItemSchema.index({ restaurantId: 1, isAvailable: 1 });
MenuItemSchema.index({ restaurantId: 1, name: 1 });

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
