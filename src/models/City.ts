import mongoose from "mongoose";

export const CitySchema = new mongoose.Schema({
  name: {type: String, unique: true, required: true},
  population: { type: Number, required: true },
  men: { type: Number, required: true },
  women: { type: Number, required: true },
  isCapital: {type: Boolean, unique: true, required: true}
});

export const City = mongoose.model("City", CitySchema);
