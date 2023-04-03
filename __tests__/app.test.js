const request = require("supertest");
const seed = require("../db/seeds/seed");
const endpointJSON = require("../endpoints.json");
const testData = require("../db/data/test-data");
const app = require("../app");
const db = require("../db/connection");
const { checkExists } = require("../utils/checkExists");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("Invalid endpoint", () => {
  test("should return a 404 status code and error message", async () => {
    const {
      status,
      body: { msg },
    } = await request(app).get("/api/category");

    expect(status).toBe(404);
    expect(msg).toBe("Endpoint does not exist");
  });
});

describe("/api/categories", () => {
  describe("GET", () => {
    test("should return a status code of 200", async () => {
      const { status } = await request(app).get("/api/categories");

      expect(status).toBe(200);
    });
    test("should return an array of 4 items on a category property", async () => {
      const {
        body: { categories },
      } = await request(app).get("/api/categories");

      expect(categories).toBeInstanceOf(Array);
      expect(categories).toHaveLength(4);
    });
    test("should return objects with the slug and description properties", async () => {
      const {
        body: { categories },
      } = await request(app).get("/api/categories");

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
  describe("POST", () => {
    test("returns a status code of 201 with a valid request body", async () => {
      const { status } = await request(app).post("/api/categories").send({
        slug: "category name here",
        description: "description here",
      });

      expect(status).toBe(201);
    });
    test("returns a newly created category object", async () => {
      const {
        body: { category },
      } = await request(app).post("/api/categories").send({
        slug: "category name here",
        description: "description here",
      });

      expect(category).toEqual({
        slug: "category name here",
        description: "description here",
      });
    });
    test("returns a 400 and error message if request body is missing the slug", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).post("/api/categories").send({
        description: "description here",
      });

      expect(status).toBe(400);
      expect(msg).toBe("Category should include a valid slug");
    });
    test("returns a 400 and error message if request body is missing the description", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).post("/api/categories").send({
        slug: "category name here",
      });

      expect(status).toBe(400);
      expect(msg).toBe("Category should include a valid description");
    });
  });
});

describe("/api/reviews/:review_id", () => {
  describe("GET", () => {
    test("returns a status code of 200", async () => {
      const { status } = await request(app).get("/api/reviews/1");

      expect(status).toBe(200);
    });
    test("returns a single review object with correct properties on a key of review", async () => {
      const {
        body: { review },
      } = await request(app).get("/api/reviews/1");

      expect(review).toEqual(
        expect.objectContaining({
          review_id: 1,
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
    test("returns an object with the comment_count property", async () => {
      const {
        body: { review },
      } = await request(app).get("/api/reviews/1");

      expect(review).toEqual(
        expect.objectContaining({
          comment_count: expect.any(Number),
        })
      );
    });
    test("returns the correct comment_count on a review that has comments", async () => {
      const {
        body: {
          review: { comment_count },
        },
      } = await request(app).get("/api/reviews/2");

      expect(comment_count).toBe(3);
    });
    test("returns the correct comment_count on a review that has zero comments", async () => {
      const {
        body: {
          review: { comment_count },
        },
      } = await request(app).get("/api/reviews/1");

      expect(comment_count).toBe(0);
    });
    test("returns a 404 status code and an error message when a user searches for a valid ID that does not exist in the database", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/reviews/100000");

      expect(status).toBe(404);
      expect(msg).toBe("Review does not exist");
    });
    test("returns a 400 status code and an error message when a user searches for an invalid ID", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/reviews/myfavouritereview");

      expect(status).toBe(400);
      expect(msg).toBe("Value does not match expected data type");
    });
  });
  describe("PATCH", () => {
    test("returns a status code of 200", async () => {
      const { status } = await request(app)
        .patch("/api/reviews/1")
        .send({ inc_votes: 1 });

      expect(status).toBe(200);
    });
    test("returns an object with the votes property increased by the correct amount", async () => {
      const {
        body: {
          review: { votes: beforeVotes },
        },
      } = await request(app).get("/api/reviews/1");
      const {
        body: {
          review: { votes: newVotes },
        },
      } = await request(app).patch("/api/reviews/1").send({ inc_votes: 1 });

      expect(newVotes).toBe(beforeVotes + 1);
    });
    test("returns an object with the votes property decreased by the correct amount", async () => {
      const {
        body: {
          review: { votes: beforeVotes },
        },
      } = await request(app).get("/api/reviews/1");
      const {
        body: {
          review: { votes: newVotes },
        },
      } = await request(app).patch("/api/reviews/1").send({ inc_votes: -30 });

      expect(newVotes).toBe(beforeVotes - 30);
    });
    test("returns a 400 status code and error message when the request body does not contain the correct key-value pair", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).patch("/api/reviews/1").send({ votes: 3 });

      expect(status).toBe(400);
      expect(msg).toBe("No valid vote change was included on the request body");
    });
    test("returns a 400 status code and error message when the request body contains an invalid value against the inc_votes key", async () => {
      const {
        status,
        body: { msg },
      } = await request(app)
        .patch("/api/reviews/banana")
        .send({ inc_votes: "banana" });

      expect(status).toBe(400);
      expect(msg).toBe("No valid vote change was included on the request body");
    });
    test("returns a 404 status code and an error message when a user searches for a valid ID that does not exist in the database", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).patch("/api/reviews/10000").send({ inc_votes: 3 });

      expect(status).toBe(404);
      expect(msg).toBe("Review does not exist");
    });
    test("returns a 400 status code and an error message when a user searches for an invalid ID", async () => {
      const {
        status,
        body: { msg },
      } = await request(app)
        .patch("/api/reviews/myfavouritereview")
        .send({ inc_votes: 3 });

      expect(status).toBe(400);
      expect(msg).toBe("Value does not match expected data type");
    });
  });
  describe("DELETE", () => {
    test("deletes review from database and returns a status code of 204 and empty body", async () => {
      const { status, body } = await request(app).delete("/api/reviews/1");

      expect(status).toBe(204);
      expect(body).toEqual({});

      const { status: postDeleteStatus } = await request(app).get(
        "/api/reviews/1"
      );

      expect(postDeleteStatus).toBe(404);
    });
    test("returns a status code of 404 and error code when passed a valid comment ID not in the database", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).delete("/api/reviews/100000");

      expect(status).toBe(404);
      expect(msg).toBe("No review found");
    });
    test("returns a status code of 400 and error code when passed an invalid ID", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).delete("/api/reviews/blorp");

      expect(status).toBe(400);
      expect(msg).toBe("Value does not match expected data type");
    });
  });
});

describe("/api/users", () => {
  describe("GET", () => {
    test("returns a status code of 200", async () => {
      const { status } = await request(app).get("/api/users");

      expect(status).toBe(200);
    });
    test("returns an array of all user objects", async () => {
      const {
        body: { users },
      } = await request(app).get("/api/users");

      expect(users).toBeInstanceOf(Array);
      expect(users).toHaveLength(4);
    });
    test("returns the correct properties on each user object", async () => {
      const {
        body: { users },
      } = await request(app).get("/api/users");

      users.forEach((user) => {
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

describe("/api/reviews", () => {
  describe("GET", () => {
    test("returns a status code of 200", async () => {
      const { status } = await request(app).get("/api/reviews");

      expect(status).toBe(200);
    });
    test("returns an array of review objects on a key of reviews", async () => {
      const {
        body: { reviews },
      } = await request(app).get("/api/reviews");

      expect(reviews).toBeInstanceOf(Array);
    });
    test("returns 10 review objects in the database by default", async () => {
      const {
        body: { reviews },
      } = await request(app).get("/api/reviews");

      expect(reviews).toHaveLength(10);
    });
    test("every review object contains the correct properties", async () => {
      const {
        body: { reviews },
      } = await request(app).get("/api/reviews");

      reviews.forEach((review) => {
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
    test("reviews are returned in descending order according to date", async () => {
      const {
        body: { reviews },
      } = await request(app).get("/api/reviews");

      expect(reviews).toBeSortedBy("created_at", { descending: true });
    });
    test("reviews are returned in ascending order according to date when order=asc is passed as a query", async () => {
      const {
        body: { reviews },
      } = await request(app).get("/api/reviews?order=asc");

      expect(reviews).toBeSortedBy("created_at");
    });
    test("reviews are sorted by a custom, valid field with the sort_by query", async () => {
      const {
        body: { reviews },
      } = await request(app).get("/api/reviews?sort_by=votes");

      expect(reviews).toBeSortedBy("votes", { descending: true });
    });
    test("reviews are sorted by a custom, valid field with the sort_by query and ordered in asc order with the order query", async () => {
      const {
        body: { reviews },
      } = await request(app).get("/api/reviews?sort_by=votes&order=asc");

      expect(reviews).toBeSortedBy("votes");
    });
    test("reviews are filtered by a category query", async () => {
      const {
        body: { reviews },
      } = await request(app).get("/api/reviews?category=euro+game");

      reviews.forEach((review) => {
        expect(review.category).toBe("euro game");
      });
    });
    test("returns correct data when all queries are used to filter, order and sort", async () => {
      const {
        body: { reviews },
      } = await request(app).get(
        "/api/reviews?sort_by=owner&order=asc&category=social+deduction"
      );

      expect(reviews).toBeSortedBy("owner");
      reviews.forEach((review) => {
        expect(review.category).toBe("social deduction");
      });
    });
    test("returns a 400 status code and error message when the user inputs an invalid sort_by query", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/reviews?sort_by=dogs");

      expect(status).toBe(400);
      expect(msg).toBe("Invalid sort_by query");
    });
    test("returns a 400 status code and error message when the user inputs an invalid order query", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/reviews?order=alphabetical");

      expect(status).toBe(400);
      expect(msg).toBe("Invalid order query");
    });
    test("returns a 404 status code and error message when the user inputs a category query that doesn't exist in the database", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/reviews?category=123");

      expect(status).toBe(404);
      expect(msg).toBe("Resource not found in the database");
    });
    test("returns a 404 status code and error message when the user inputs a category query that exists but has no reviews", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/reviews?category=children's+games");

      expect(status).toBe(404);
      expect(msg).toBe("This category has no associated reviews");
    });
    test("accepts a limit query as a number, returning the specified number of results", async () => {
      const {
        status,
        body: { reviews },
      } = await request(app).get("/api/reviews?limit=5");

      expect(status).toBe(200);
      expect(reviews).toHaveLength(5);
    });
    test("accepts a page query which offsets the results by a certain amount", async () => {
      const {
        status,
        body: { reviews },
      } = await request(app).get("/api/reviews?limit=10&p=2");

      expect(status).toBe(200);
      expect(reviews).toHaveLength(3);
    });
    test("returns 400 and an error message if limit is not a number", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/reviews?limit=banana&p=3");

      expect(status).toBe(400);
      expect(msg).toBe("Limit and page queries should be a number value");
    });
    test("returns 400 and an error message if page query is not a number", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/reviews?limit=5&p=banana");

      expect(status).toBe(400);
      expect(msg).toBe("Limit and page queries should be a number value");
    });
    test("returns a total_count property on the results object with the total number of articles with filters and the current page number", async () => {
      const {
        body: { total_count, reviews, page },
      } = await request(app).get("/api/reviews?p=1");

      expect(total_count).toBe(13);
      expect(reviews).toHaveLength(10);
      expect(page).toBe(1);
    });
  });
  describe("POST", () => {
    test("returns a status of 201 when passed a valid request body", async () => {
      const input = {
        owner: "mallionaire",
        title: "That Pirate Game",
        review_body: "test_body",
        designer: "test_designer",
        category: "dexterity",
      };
      const { status } = await request(app).post("/api/reviews").send(input);

      expect(status).toBe(201);
    });
    test("returns a newly added review object when the request body is valid", async () => {
      const input = {
        owner: "mallionaire",
        title: "That Pirate Game",
        review_body: "test_body",
        designer: "test_designer",
        category: "dexterity",
      };
      const {
        body: { review },
      } = await request(app).post("/api/reviews").send(input);

      expect(review).toEqual(
        expect.objectContaining({
          review_id: 14,
          title: "That Pirate Game",
          category: "dexterity",
          designer: "test_designer",
          owner: "mallionaire",
          review_body: "test_body",
          review_img_url:
            "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg",
          created_at: expect.any(String),
          votes: 0,
        })
      );
    });
    test("returns a a 400 and error code when invalid owner is included on the request body", async () => {
      const input = {
        owner: "not_in_the_database",
        title: "That Pirate Game",
        review_body: "test_body",
        designer: "test_designer",
        category: "dexterity",
      };
      const {
        status,
        body: { msg },
      } = await request(app).post("/api/reviews").send(input);

      expect(status).toBe(400);
      expect(msg).toBe("Required value does not exist");
    });
    test("returns a a 400 and error code when invalid category is included on the request body", async () => {
      const input = {
        owner: "mallionaire",
        title: "That Pirate Game",
        review_body: "test_body",
        designer: "test_designer",
        category: "not_a_valid_category",
      };
      const {
        status,
        body: { msg },
      } = await request(app).post("/api/reviews").send(input);

      expect(status).toBe(400);
      expect(msg).toBe("Required value does not exist");
    });
    test("returns a a 400 and error code when body does not contain required information", async () => {
      const input = {
        owner: "mallionaire",
        review_body: "test_body",
        designer: "test_designer",
        category: "not_a_valid_category",
      };
      const {
        status,
        body: { msg },
      } = await request(app).post("/api/reviews").send(input);

      expect(status).toBe(400);
      expect(msg).toBe("Expected value cannot be null");
    });
    test("returns a a 400 and error code when body does not contain valid value against a required key", async () => {
      const input = {
        owner: "mallionaire",
        title: "That Pirate Game",
        review_body: { body: "hello" },
        designer: "test_designer",
        category: "dexterity",
      };
      const {
        status,
        body: { msg },
      } = await request(app).post("/api/reviews").send(input);

      expect(status).toBe(400);
      expect(msg).toBe("Values should only be strings");
    });
  });
});

describe("/api/reviews/:review_id/comments", () => {
  describe("GET", () => {
    test("return a status code of 200", async () => {
      const { status } = await request(app).get("/api/reviews/2/comments");

      expect(status).toBe(200);
    });
    test("return an array of all corresponding comments on the key of comments where review has comments", async () => {
      const {
        body: { comments },
      } = await request(app).get("/api/reviews/2/comments");

      expect(comments).toBeInstanceOf(Array);
      expect(comments).toHaveLength(3);
    });
    test("return an empty array on the key of comments where review has no comments", async () => {
      const {
        body: { comments },
      } = await request(app).get("/api/reviews/1/comments");

      expect(comments).toEqual([]);
    });
    test("all returned comment objects have the correct properties", async () => {
      const {
        body: { comments },
      } = await request(app).get("/api/reviews/2/comments");

      comments.forEach((comment) => {
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
    test("returns a specified number of comments with a valid limit query", async () => {
      const {
        body: { comments },
      } = await request(app).get("/api/reviews/2/comments?limit=2");

      expect(comments).toBeInstanceOf(Array);
      expect(comments).toHaveLength(2);
    });
    test("adds pagination if client uses a page query", async () => {
      const {
        body: { comments: page1Comments },
      } = await request(app).get("/api/reviews/2/comments?limit=2&p=1");

      expect(page1Comments).toBeInstanceOf(Array);
      expect(page1Comments).toHaveLength(2);

      const {
        body: { comments: page2Comments },
      } = await request(app).get("/api/reviews/2/comments?limit=2&p=2");

      expect(page2Comments).toBeInstanceOf(Array);
      expect(page2Comments).toHaveLength(1);
    });
    test("return a status code of 404 and error message when passed a valid id not matching a review in the database", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/reviews/100000/comments");

      expect(status).toBe(404);
      expect(msg).toBe("Review does not exist");
    });
    test("return a status code of 400 and error message when passed an invalid id", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/reviews/banana/comments");

      expect(status).toBe(400);
      expect(msg).toBe("Value does not match expected data type");
    });
    test("returns 400 and an error message if page query is not a number", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/reviews/2/comments?limit=banana&p=3");

      expect(status).toBe(400);
      expect(msg).toBe("Limit and page queries should be a number value");
    });
    test("returns 400 and an error message if limit is not a number", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/reviews/2/comments?limit=4&p=banana");

      expect(status).toBe(400);
      expect(msg).toBe("Limit and page queries should be a number value");
    });
  });
  describe("POST", () => {
    test("returns a status code of 201", async () => {
      const { status } = await request(app)
        .post("/api/reviews/1/comments")
        .send({ username: "mallionaire", body: "test_body" });

      expect(status).toBe(201);
    });
    test("returns a comment object on a key of object with valid request body and review_id", async () => {
      const input = { username: "mallionaire", body: "test_body" };
      const {
        body: { comment },
      } = await request(app).post("/api/reviews/1/comments").send(input);

      expect(comment).toEqual(
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
    test("adds the new comment to the database when request body and review_id are valid", async () => {
      const input = { username: "mallionaire", body: "test_body" };
      const {
        body: { comments: commentsBefore },
      } = await request(app).get("/api/reviews/1/comments");

      const numberOfCommentsBefore = commentsBefore.length;

      await request(app).post("/api/reviews/1/comments").send(input);

      const {
        body: { comments: commentsAfter },
      } = await request(app).get("/api/reviews/1/comments");

      const numberOfCommentsAfter = commentsAfter.length;

      expect(numberOfCommentsAfter).toBe(numberOfCommentsBefore + 1);
    });

    test("returns a status code of 400 and error message when passed an invalid review_id", async () => {
      const {
        status,
        body: { msg },
      } = await request(app)
        .post("/api/reviews/banana/comments")
        .send({ username: "mallionaire", body: "test_body" });

      expect(status).toBe(400);
      expect(msg).toBe("Value does not match expected data type");
    });
    test("returns a status code of 404 and error message when passed a valid review_id not in the system", async () => {
      const {
        status,
        body: { msg },
      } = await request(app)
        .post("/api/reviews/10000/comments")
        .send({ username: "mallionaire", body: "test_body" });

      expect(status).toBe(404);
      expect(msg).toBe("Review does not exist");
    });
    test("returns a status code of 400 and error message when passed an object missing the username key", async () => {
      const {
        status,
        body: { msg },
      } = await request(app)
        .post("/api/reviews/1/comments")
        .send({ body: "hello" });

      expect(status).toBe(400);
      expect(msg).toBe("Missing valid author information");
    });
    test("returns a status code of 400 and error message when passed an object missing the body key", async () => {
      const {
        status,
        body: { msg },
      } = await request(app)
        .post("/api/reviews/1/comments")
        .send({ username: "mallionaire" });

      expect(status).toBe(400);
      expect(msg).toBe("Missing valid body information");
    });
    test("returns a status code of 400 and error message when passed an object missing the body and username key", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).post("/api/reviews/1/comments").send({});

      expect(status).toBe(400);
      expect(msg).toBe("Missing valid body and author information");
    });
    test("returns a status code of 400 and error message when passed a username not present in the system", async () => {
      const {
        status,
        body: { msg },
      } = await request(app)
        .post("/api/reviews/1/comments")
        .send({ username: "test_username", body: "test_body" });

      expect(status).toBe(400);
      expect(msg).toBe("Required value does not exist");
    });
    test("returns a status code of 400 and error message when passed an empty body", async () => {
      const {
        status,
        body: { msg },
      } = await request(app)
        .post("/api/reviews/1/comments")
        .send({ username: "mallionaire", body: "" });

      expect(status).toBe(400);
      expect(msg).toBe("Missing valid body information");
    });
  });
});

describe("/api/comments/:comment_id", () => {
  describe("DELETE", () => {
    test("returns a status code of 204 and no body content", async () => {
      const { status, body } = await request(app).delete("/api/comments/1");

      expect(status).toBe(204);
      expect(body).toEqual({});
    });
    test("removes correct comment from the database", async () => {
      const {
        body: { comments: commentsBefore },
      } = await request(app).get("/api/reviews/2/comments");

      const lengthBefore = commentsBefore.length;

      const { status } = await request(app).delete("/api/comments/1");

      expect(status).toBe(204);

      const {
        body: { comments: commentsAfter },
      } = await request(app).get("/api/reviews/2/comments");

      const lengthAfter = commentsAfter.length;

      expect(lengthAfter).toBe(lengthBefore - 1);
    });
    test("returns a status code of 404 and error code when passed a valid comment ID not in the database", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).delete("/api/comments/10000");

      expect(status).toBe(404);
      expect(msg).toBe("No comment found");
    });
    test("returns a status code of 400 and error code when passed an invalid ID", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).delete("/api/comments/blorp");

      expect(status).toBe(400);
      expect(msg).toBe("Value does not match expected data type");
    });
  });
  describe("PATCH", () => {
    test("returns a status code of 200 when passed valid request body", async () => {
      const { status } = await request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: 1 });

      expect(status).toBe(200);
    });
    test("returns an updated comment object with votes value correctly changed", async () => {
      const {
        body: { comment },
      } = await request(app).patch("/api/comments/1").send({ inc_votes: 4 });

      expect(comment).toEqual({
        comment_id: 1,
        body: "I loved this game too!",
        review_id: 2,
        author: "bainesface",
        votes: 20,
        created_at: "2017-11-22T12:43:33.389Z",
      });
    });
    test("returns a 404 and error message when passed a non-existent but valid comment ID", async () => {
      const {
        status,
        body: { msg },
      } = await request(app)
        .patch("/api/comments/10000")
        .send({ inc_votes: 4 });

      expect(status).toBe(404);
      expect(msg).toBe("Comment does not exist");
    });
    test("returns a 400 and error message when passed an invalid ID", async () => {
      const {
        status,
        body: { msg },
      } = await request(app)
        .patch("/api/comments/banana")
        .send({ inc_votes: 4 });

      expect(status).toBe(400);
      expect(msg).toBe("Value does not match expected data type");
    });
    test("returns a 400 and error message when passed a request body with no inc_votes property", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).patch("/api/comments/1").send({ votes: 2 });

      expect(status).toBe(400);
      expect(msg).toBe("No valid vote change was included on the request body");
    });
    test("returns a 400 and error message when passed an invalid request body", async () => {
      const {
        status,
        body: { msg },
      } = await request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: "banana" });

      expect(status).toBe(400);
      expect(msg).toBe("No valid vote change was included on the request body");
    });
  });
});

describe("/api", () => {
  describe("GET", () => {
    test("returns a status code of 200", async () => {
      const { status } = await request(app).get("/api");

      expect(status).toBe(200);
    });
    test("returns a JSON describing all endpoints", async () => {
      const {
        body: { endpoints },
      } = await request(app).get("/api");

      expect(endpoints).toEqual(endpointJSON);
    });
  });
});

describe("/api/users/:username", () => {
  describe("GET", () => {
    test("returns a status code of 200", async () => {
      const { status } = await request(app).get("/api/users/mallionaire");

      expect(status).toBe(200);
    });
    test("returns a user object with the correct properties", async () => {
      const {
        body: { user },
      } = await request(app).get("/api/users/mallionaire");

      expect(user).toEqual(
        expect.objectContaining({
          username: "mallionaire",
          avatar_url: expect.any(String),
          name: expect.any(String),
        })
      );
    });
    test("returns the correct user object", async () => {
      const {
        body: { user },
      } = await request(app).get("/api/users/mallionaire");

      expect(user).toEqual(
        expect.objectContaining({
          username: "mallionaire",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
          name: "haz",
        })
      );
    });
    test("returns a 404 if user inputs a username not in the database", async () => {
      const {
        status,
        body: { msg },
      } = await request(app).get("/api/users/test_username");

      expect(status).toBe(404);
      expect(msg).toBe("User does not exist");
    });
  });
});

describe("checkExists function", () => {
  test("does not return an error if item exists in the correct table and column", async () => {
    const output = await checkExists("reviews", "review_id", 1);
    expect(output).toBe(undefined);
  });
  test("returns a rejected promise with an error if item is valid but does not exist in the correct table and column", async () => {
    try {
      await checkExists("reviews", "review_id", 10000);
    } catch (err) {
      expect(err).toEqual({
        status: 404,
        msg: "Resource not found in the database",
      });
    }
  });
});
