const request = require("supertest");
const seed = require("../db/seeds/seed");
const jestsorted = require("jest-sorted");
const fs = require("fs/promises");
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
    test("reviews are returned in ascending order according to date when order=asc is passed as a query", () => {
      return request(app)
        .get("/api/reviews?order=asc")
        .then(({ body }) => {
          expect(body.reviews).toBeSortedBy("created_at");
        });
    });
    test("reviews are sorted by a custom, valid field with the sort_by query", () => {
      return request(app)
        .get("/api/reviews?sort_by=votes")
        .then(({ body }) => {
          expect(body.reviews).toBeSortedBy("votes", { descending: true });
        });
    });
    test("reviews are sorted by a custom, valid field with the sort_by query and ordered in asc order with the order query", () => {
      return request(app)
        .get("/api/reviews?sort_by=votes&order=asc")
        .then(({ body }) => {
          expect(body.reviews).toBeSortedBy("votes");
        });
    });
    test("reviews are filtered by a category query", () => {
      return request(app)
        .get("/api/reviews?category=euro+game")
        .then(({ body }) => {
          body.reviews.forEach((review) => {
            expect(review.category).toBe("euro game");
          });
        });
    });
    test("returns correct data when all queries are used to filter, order and sort", () => {
      return request(app)
        .get("/api/reviews?sort_by=owner&order=asc&category=social+deduction")
        .then(({ body }) => {
          expect(body.reviews).toBeSortedBy("owner");
          body.reviews.forEach((review) => {
            expect(review.category).toBe("social deduction");
          });
        });
    });
    test("returns a 400 status code and error message when the user inputs an invalid sort_by query", () => {
      return request(app)
        .get("/api/reviews?sort_by=dogs")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid sort_by query");
        });
    });
    test("returns a 400 status code and error message when the user inputs an invalid order query", () => {
      return request(app)
        .get("/api/reviews?order=alphabetical")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid order query");
        });
    });
    test("returns a 404 status code and error message when the user inputs a category query that doesn't exist in the database", () => {
      return request(app)
        .get("/api/reviews?category=123")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource not found in the database");
        });
    });
    test("returns a 404 status code and error message when the user inputs a category query that exists but has no reviews", () => {
      return request(app)
        .get("/api/reviews?category=children's+games")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("This category has no associated reviews");
        });
    });
  });
});

describe("/api/reviews/:review_id/comments", () => {
  describe("GET", () => {
    test("return a status code of 200", () => {
      return request(app).get("/api/reviews/2/comments").expect(200);
    });
    test("return an array of all corresponding comments on the key of comments where review has comments", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .then(({ body }) => {
          expect(body.comments).toBeInstanceOf(Array);
          expect(body.comments).toHaveLength(3);
        });
    });
    test("return an empty array on the key of comments where review has no comments", () => {
      return request(app)
        .get("/api/reviews/1/comments")
        .then(({ body }) => {
          expect(body.comments).toBeInstanceOf(Array);
          expect(body.comments).toHaveLength(0);
        });
    });
    test("all returned comment objects have the correct properties", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .then(({ body }) => {
          body.comments.forEach((comment) => {
            expect(comment).toEqual(
              expect.objectContaining({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                review_id: 2,
              })
            );
          });
        });
    });
    test("return a status code of 404 and error message when passed a valid id not matching a review in the database", () => {
      return request(app)
        .get("/api/reviews/100000/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Review does not exist");
        });
    });
    test("return a status code of 400 and error message when passed an invalid id", () => {
      return request(app)
        .get("/api/reviews/banana/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid PSQL input");
        });
    });
  });
  describe("POST", () => {
    test("returns a status code of 201", () => {
      return request(app)
        .post("/api/reviews/1/comments")
        .send({ username: "mallionaire", body: "test_body" })
        .expect(201);
    });
    test("returns a comment object on a key of object with valid request body and review_id", () => {
      const input = { username: "mallionaire", body: "test_body" };
      return request(app)
        .post("/api/reviews/1/comments")
        .send(input)
        .then(({ body }) => {
          expect(body.comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: 0,
              created_at: expect.any(String),
              author: input.username,
              body: input.body,
              review_id: 1,
            })
          );
        });
    });
    test("adds the new comment to the database when request body and review_id are valid", () => {
      const input = { username: "mallionaire", body: "test_body" };
      return request(app)
        .get("/api/reviews/1/comments")
        .then(({ body }) => {
          const numberOfCommentsBefore = body.comments.length;
          return request(app)
            .post("/api/reviews/1/comments")
            .send(input)
            .then(({ body }) => {
              return request(app)
                .get("/api/reviews/1/comments")
                .then(({ body }) => {
                  const numberOfCommentsAfter = body.comments.length;
                  expect(numberOfCommentsAfter).toBe(
                    numberOfCommentsBefore + 1
                  );
                });
            });
        });
    });
    test("returns a status code of 400 and error message when passed an invalid review_id", () => {
      return request(app)
        .post("/api/reviews/banana/comments")
        .send({ username: "mallionaire", body: "test_body" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Invalid PSQL input");
        });
    });
    test("returns a status code of 404 and error message when passed a valid review_id not in the system", () => {
      return request(app)
        .post("/api/reviews/10000/comments")
        .send({ username: "mallionaire", body: "test_body" })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Review does not exist");
        });
    });
    test("returns a status code of 400 and error message when passed an object missing the username key", () => {
      return request(app)
        .post("/api/reviews/1/comments")
        .send({ body: "hello" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Missing valid author information");
        });
    });
    test("returns a status code of 400 and error message when passed an object missing the body key", () => {
      return request(app)
        .post("/api/reviews/1/comments")
        .send({ username: "mallionaire" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Missing valid body information");
        });
    });
    test("returns a status code of 400 and error message when passed an object missing the body and username key", () => {
      return request(app)
        .post("/api/reviews/1/comments")
        .send({})
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Missing valid body and author information");
        });
    });
    test("returns a status code of 400 and error message when passed a username not present in the system", () => {
      return request(app)
        .post("/api/reviews/1/comments")
        .send({ username: "test_username", body: "test_body" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe(
            "Attempted to reference a foreign key not present in the database"
          );
        });
    });
    test("returns a status code of 400 and error message when passed an empty body", () => {
      return request(app)
        .post("/api/reviews/1/comments")
        .send({ username: "mallionaire", body: "" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Missing valid body information");
        });
    });
  });
});

describe("/api/comments/:comment_id", () => {
  describe("DELETE", () => {
    test("returns a status code of 204 and no body content", () => {
      return request(app)
        .delete("/api/comments/1")
        .expect(204)
        .then(({ body }) => {
          expect(body).toEqual({});
        });
    });
    test("removes correct comment from the database", () => {
      //This test works only with this test data. As we don't have a /api/comments API to make a get request to, this test manually checks that the review was deleted through its association with review_id 2
      return request(app)
        .get("/api/reviews/2/comments")
        .then(({ body }) => {
          const lengthBefore = body.comments.length;
          return request(app)
            .delete("/api/comments/1")
            .expect(204)
            .then(() => {
              return request(app)
                .get("/api/reviews/2/comments")
                .then(({ body }) => {
                  const lengthAfter = body.comments.length;
                  expect(lengthAfter).toBe(lengthBefore - 1);
                });
            });
        });
    });
    test("returns a status code of 404 and error code when passed a valid comment ID not in the database", () => {
      return request(app)
        .delete("/api/comments/10000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No comment found");
        });
    });
    test("returns a status code of 400 and error code when passed an invalid ID", () => {
      return request(app)
        .delete("/api/comments/blorp")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid PSQL input");
        });
    });
  });
});

describe("/api", () => {
  describe("GET", () => {
    test("returns a status code of 200", () => {
      return request(app).get("/api").expect(200);
    });
    test("returns a JSON describing all endpoints", () => {
      return Promise.all([
        request(app).get("/api"),
        fs.readFile("./endpoints.json", "utf-8"),
      ]).then(([{ body }, endPointInfo]) => {
        const parsedBody = JSON.parse(endPointInfo);
        expect(body.endpoints).toEqual(parsedBody);
      });
    });
  });
});
