import express from "express";
import { body, header, param, query } from "express-validator";
import { checkErrors } from "./utils";
import { City } from "../models/City";
const router = express.Router();




router.get(
  "/",
  body("name").optional().isString(),
  body("population").optional().isNumeric(),
  body("men").optional().isNumeric(),
  body("women").optional().isNumeric(),
  body("isCapital").optional().isBoolean(),
  checkErrors,
  async (req, res) => {
    const cities = await City.find({ ...req.query });
    res.json(cities);
}
);

router.get("/:id", 
param("id").isMongoId(), checkErrors, async (req, res) => {
  const { id } = req.params;
  const cities = await City.findById(id);
  if (!cities) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json(cities);
});

router.post(
  "/",
  body("name").exists().isString(),
  body("population").exists().isNumeric(),
  body("men").exists().isNumeric(),
  body("women").exists().isNumeric(),
  body("isCapital").optional().isBoolean(),
  checkErrors,
  async (req, res) => {
    const { name, population, men, women, isCapital } = req.body;
    const cities = new City({ name, population, men, women, isCapital});
    const citySaved = await cities.save();
    res.status(201).json(citySaved);
  }
);

router.put(
  "/:id",
  param("id").isMongoId(),
  body("name").exists().isString(),
  body("population").exists().isNumeric(),
  body("men").exists().isNumeric(),
  body("women").exists().isNumeric(),
  body("isCapital").optional().isBoolean(),
  checkErrors,
  async (req, res) => {
    const { id } = req.params;
    const { name, population, men, women, isCapital } = req.body;
    try {
      const cities = await City.findById(id);
      if (!cities) {
        return res.status(404).json({ message: "city not found" });
      }
      cities.name = name;
      cities.population = population;
      cities.men = men;
      cities.women = women;
      cities.isCapital = isCapital;
      const CitySaved = await cities.save();
      res.json(CitySaved);
    } catch (err) {
      res.status(500).json({ err });
    }
  }
);

router.delete(
  "/:id",
  param("id").isMongoId(),
  checkErrors,
  async (req, res) => {
    const { id } = req.params;
    const cities = await City.findById(id);
    if (!cities) {
      return res.status(404).json({ message: "city not found" });
    }
    await City.findByIdAndDelete(id);
    res.json({ message: "city deleted" });
  }
);


router.post("/merge",
async (req, res) => {
  try {
    // Verify that the necessary parameters have been provided
    const { city1Id, city2Id, mergedCityName } = req.body;
    if (!city1Id || !city2Id || !mergedCityName) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // Find the two cities to merge.
    const city1 = await City.findById(city1Id);
    const city2 = await City.findById(city2Id);

    if (!city1 || !city2) {
      return res.status(404).json({ error: "City not found" });
    }

    // "Create the new city by merging the information of the two cities."
    const mergedCity = new City({
      name: mergedCityName,
      population: city1.population + city2.population,
      men: city1.men + city2.men,
      women: city1.women + city2.women,
      isCapital: city1.isCapital || city2.isCapital,
    });

    // Save the new city and remove the old cities.
    const savedMergedCity = await mergedCity.save();
    await City.deleteOne({ _id: city1._id });
    await City.deleteOne({ _id: city2._id });

    res.json(savedMergedCity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
