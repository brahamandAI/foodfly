import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryImage extends Document {
  _id: string; // `${restaurantId}::${category}`
  restaurantId: string;
  category: string;
  imageUrl: string; // Cloudinary optimized URL
  originalUrl?: string; // Cloudinary original URL
  provider?: string; // pexels|pixabay
  publicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryImageSchema: Schema<ICategoryImage> = new Schema({
  _id: { type: String, required: true },
  restaurantId: { type: String, required: true, index: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  originalUrl: { type: String },
  provider: { type: String },
  publicId: { type: String }
}, { timestamps: true, _id: false });

CategoryImageSchema.index({ restaurantId: 1, category: 1 }, { unique: true });

export default mongoose.models.CategoryImage || mongoose.model<ICategoryImage>('CategoryImage', CategoryImageSchema);


