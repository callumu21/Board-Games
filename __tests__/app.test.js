const request = require("supertest");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const app = require("../app");
const db = require("../db/connection");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("Invalid endpoint", () => {
  test("should return a 404 status code and an error message of 'Endpoint does not exist'", () => {
    return request(app)
      .get("/api/category")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Endpoint does not exist");
      });
  });
});

describe("/api/categories", () => {
  describe("GET", () => {
    test("should return a status code of 200", () => {
      return request(app).get("/api/categories").expect(200);
    });
  });
  test("should return an array of 4 items on a category property", () => {
    return request(app)
      .get("/api/categories")
      .then(({ body }) => {
        expect(body.categories).toBeInstanceOf(Array);
        expect(body.categories).toHaveLength(4);
      });
  });
  test("should return objects with the slug and description properties", () => {
    return request(app)
      .get("/api/categories")
      .then(({ body }) => {
        const { categories } = body;
        categories.forEach((category) => {
          expect(category).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});
