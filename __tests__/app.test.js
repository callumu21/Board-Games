const request = require("supertest");
const seed = require("../db/seeds/seed");
const jestsorted = require("jest-sorted");
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
    test("returns an object with the comment_count property", () => {
      return request(app)
        .get("/api/reviews/1")
        .then(({ body }) => {
          expect(body.review).toEqual(
            expect.objectContaining({
              comment_count: expect.any(Number),
            })
          );
        });
    });
    test("returns the correct comment_count on a review that has comments", () => {
      return request(app)
        .get("/api/reviews/2")
        .then(({ body }) => {
          expect(body.review.comment_count).toBe(3);
        });
    });
    test("returns the correct comment_count on a review that has zero comments", () => {
      return request(app)
        .get("/api/reviews/1")
        .then(({ body }) => {
          expect(body.review.comment_count).toBe(0);
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
  describe("PATCH", () => {
    test("returns a status code of 200", () => {
      return request(app)
        .patch("/api/reviews/1")
        .send({ inc_votes: 1 })
        .expect(200);
    });
    test("returns an object with the votes property increased by the correct amount", () => {
      return request(app)
        .get("/api/reviews/1")
        .then(({ body: { review } }) => {
          const { votes: beforeVotes } = review;
          return request(app)
            .patch("/api/reviews/1")
            .send({ inc_votes: 1 })
            .then(({ body: { review } }) => {
              const { votes: newVotes } = review;
              expect(newVotes).toBe(beforeVotes + 1);
            });
        });
    });
    test("returns an object with the votes property decreased by the correct amount", () => {
      return request(app)
        .get("/api/reviews/1")
        .then(({ body: { review } }) => {
          const { votes: beforeVotes } = review;
          return request(app)
            .patch("/api/reviews/1")
            .send({ inc_votes: -30 })
            .then(({ body: { review } }) => {
              const { votes: newVotes } = review;
              expect(newVotes).toBe(beforeVotes - 30);
            });
        });
    });
    test("returns a 400 status code and error message when the request body does not contain the correct key-value pair", () => {
      return request(app)
        .patch("/api/reviews/1")
        .send({ votes: 3 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "No valid vote change was included on the request body"
          );
        });
    });
    test("returns a 400 status code and error message when the request body contains an invalid value against the inc_votes key", () => {
      return request(app)
        .patch("/api/reviews/banana")
        .send({ inc_votes: "banana" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "No valid vote change was included on the request body"
          );
        });
    });
    test("returns a 404 status code and an error message when a user searches for a valid ID that does not exist in the database", () => {
      return request(app)
        .patch("/api/reviews/10000")
        .send({ inc_votes: 3 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Review does not exist");
        });
    });
    test("returns a 400 status code and an error message when a user searches for an invalid ID", () => {
      return request(app)
        .patch("/api/reviews/myfavouritereview")
        .send({ inc_votes: 3 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid PSQL input");
        });
    });
  });
});

describe("/api/users", () => {
  describe("GET", () => {
    test("returns a status code of 200", () => {
      return request(app).get("/api/users").expect(200);
    });
    test("returns an array of all user objects", () => {
      return request(app)
        .get("/api/users")
        .then(({ body }) => {
          expect(body.users).toBeInstanceOf(Array);
          expect(body.users).toHaveLength(4);
        });
    });
    test("returns the correct properties on each user object", () => {
      return request(app)
        .get("/api/users")
        .then(({ body }) => {
          body.users.forEach((user) => {
            expect(user).toEqual(
              expect.objectContaining({
                username: expect.any(String),
                name: expect.any(String),
                avatar_url: expect.any(String),
              })
            );
          });
        });
    });
  });
});

describe("/api/reviews", () => {
  describe("GET", () => {
    test("returns a status code of 200", () => {
      return request(app).get("/api/reviews").expect(200);
    });
    test("returns an array of review objects against a property of reviews", () => {
      return request(app)
        .get("/api/reviews")
        .then(({ body }) => {
          expect(body.reviews).toBeInstanceOf(Array);
        });
    });
    test("returns all review objects in the database", () => {
      return request(app)
        .get("/api/reviews")
        .then(({ body }) => {
          expect(body.reviews).toHaveLength(13);
        });
    });
    test("every review object contains the correct properties", () => {
      return request(app)
        .get("/api/reviews")
        .then(({ body }) => {
          body.reviews.forEach((review) => {
            expect(review).toEqual(
              expect.objectContaining({
                owner: expect.any(String),
                title: expect.any(String),
                review_id: expect.any(Number),
                category: expect.any(String),
                review_img_url: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                designer: expect.any(String),
                comment_count: expect.any(Number),
              })
            );
          });
        });
    });
    test("reviews are returned in descending order according to date", () => {
      return request(app)
        .get("/api/reviews")
        .then(({ body }) => {
          expect(body.reviews).toBeSortedBy("created_at", { descending: true });
        });
    });
  });
});
