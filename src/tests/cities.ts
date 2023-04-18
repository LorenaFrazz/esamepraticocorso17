import request from "supertest";
import { app } from "../app";
import { City } from "../models/City"
const basicUrl="/v1/cities";
require("chai").should();

const city = {
    name: "Roma",
    population: 2870000,
    men: 1390000,
    women: 1480000,
    isCapital: true,
}

describe("Create a City", () => {
    let id: string;
    after(async () => {
      await City.findByIdAndDelete(id);
    });
    it("Success 200", async () => {
      const { status, body } = await request(app)
        .post(basicUrl)
        .send(city)
      status.should.be.equal(201);
      body.should.have.property("_id");
      body.should.have.property("name").equal(city.name);
      body.should.have.property("population").equal(city.population);
      body.should.have.property("men").equal(city.men);
      body.should.have.property("women").equal(city.women);
      body.should.have.property("isCapital").equal(city.isCapital);
      id = body._id;
});
});

describe("Delete a City", () => {
    let id: string;
    const newName= "Girls"
    before(async () => {
      const ci = await City.create(city);
      id = ci._id.toString();
    });
    it("Error 404", async () => {
        const testid = "diamondsinthesky4785748" + id.substring(1);
        const { status } = await request(app)
        .delete(`${basicUrl}/${testid}`)
        .send({ ...city, name: newName })
        status.should.be.equal(404);
    });
    it("Success 200", async () => {
      const { status } = await request(app)
        .delete(`${basicUrl}/${id}`)
      status.should.be.equal(200);
    });
});

describe("Update a City", () => {
    let id: string;
    const newName= "Milano"
    before(async () => {
      const ci = await City.create(city);
      id = ci._id.toString();
    });
    after(async () => {
      await City.findByIdAndDelete(id);
    });
    it("Success 200", async () => {
        const { status, body } = await request(app)
            .put(`${basicUrl}/${id}`)
            .send({ ...city, name: newName })
        status.should.be.equal(200);
        body.should.have.property("_id");
        body.should.have.property("name").equal(newName);
    });

    it("Unsuccess 404", async () => {
        const fakeId = "diamondsinthesky4785748" + id.substring(1);
        const { status } = await request(app)
            .put(`${basicUrl}/${fakeId}`)
            .send({ ...city, name: newName })
        status.should.be.equal(404);
    });


    it("Unsuccess 400", async () => {
      const fakeCity = { ...city } as any;
      delete fakeCity.Name;
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCity)
      status.should.be.equal(400);
    });

    it("Unsuccess 400", async () => {
      const fakeCity = { ...city } as any;
      fakeCity.Population = "Goleador";
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCity)
      status.should.be.equal(400);
    });

    it("Unsuccess 400", async () => {
        const fakeCity = { ...city } as any;
        fakeCity.Men = "Braccioli";
        const { status } = await request(app)
          .put(`${basicUrl}/${id}`)
          .send(fakeCity)
        status.should.be.equal(400);
      });

    it("Unsuccess 400", async () => {
    const fakeCity = { ...city } as any;
    fakeCity.Women = "Mattonella";
    const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send(fakeCity)
    status.should.be.equal(400);
    });
});
    describe("Get a city", () => {
        let id: string;
        before(async () => {
          const ci = await City.create(city);
          id = ci._id.toString();
        });
        after(async () => {
          await City.findByIdAndDelete(id);
        });
        it("Success 200", async () => {
          const { status, body } = await request(app).get(`${basicUrl}/${id}`);
          status.should.be.equal(200);
          body.should.have.property("_id");
          body.should.have.property("name").equal(city.name);
          body.should.have.property("population").equal(city.population);
          body.should.have.property("men").equal(city.men);
          body.should.have.property("women").equal(city.women);
          body.should.have.property("isCapital").equal(city.isCapital);
        });
        it("Unsuccess 404", async () => {
          const fakeId = "diamondsinthesky4785748" + id.substring(1);
          const { status } = await request(app).get(`${basicUrl}/${fakeId}`);
          status.should.be.equal(404);
        });
      });
    
      describe("Get Cities", () => {
        let ids: string[] = [];
        const cities = [
            {
                name: 'Roma',
                population: 2870000,
                men: 1390000,
                women: 1480000,
                isCapital: true
              },
              {
                name: 'Milano',
                population: 1366000,
                men: 672000,
                women: 694000,
                isCapital: false
              },
              {
                name: 'Napoli',
                population: 967000,
                men: 466000,
                women: 501000,
                isCapital: false
              },
              {
                name: 'Catania',
                population: 311584,
                men: 147919,
                women: 163665,
                isCapital: false
              }
        ];
        before(async () => {
          const response = await Promise.all([
            City.create(cities[0]),
            City.create(cities[1]),
            City.create(cities[2]),
            City.create(cities[3]),
          ]);
          ids = response.map((item) => item._id.toString());
        });
        after(async () => {
          await Promise.all([
            City.findByIdAndDelete(ids[0]),
            City.findByIdAndDelete(ids[1]),
            City.findByIdAndDelete(ids[2]),
            City.findByIdAndDelete(ids[3]),

          ]);
        });
    
        it("Success 200", async () => {
          const { status, body } = await request(app).get(basicUrl);
          status.should.be.equal(200);
          body.should.have.property("length").equal(cities.length);
        });
    
        it("Success 200", async () => {
          const { status, body } = await request(app).get(
            `${basicUrl}?name=Catania`
          );
          status.should.be.equal(200);
          body.should.have.property("length").equal(1);
     });
});
