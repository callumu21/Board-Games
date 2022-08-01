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
});

describe("/api/reviews/:review_id", () => {
  describe("GET", () => {
    test("returns a status code of 200", () => {
      return request(app).get("/api/reviews/1").expect(200);
    });
    test("returns a single review object on a property of review with the keys review_id, title, review_body, designer, review_img_url, votes, category, owner, and created_at", () => {
      return request(app)
        .get("/api/reviews/1")
        .then(({ body }) => {
          const review = body.review;
          expect(review).toEqual(
            expect.objectContaining({
              review_id: expect.any(Number),
              title: expect.any(String),
              review_body: expect.any(String),
              designer: expect.any(String),
              review_img_url: expect.any(String),
              votes: expect.any(Number),
              category: expect.any(String),
              owner: expect.any(String),
              created_at: expect.any(String),
            })
          );
        });
    });
    test("returns a 404 status code and an error message when a user searches for a valid ID that does not exist in the database", () => {
      return request(app)
        .get("/api/reviews/100000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Review does not exist");
        });
    });
    test("returns a 400 status code and an error message when a user searches for an invalid ID", () => {
      return request(app)
        .get("/api/reviews/myfavouritereview")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid PSQL input");
        });
    });
  });
});
