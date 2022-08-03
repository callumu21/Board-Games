const { checkExists } = require("../utils/checkExists");

describe("checkExists function", () => {
  test("does not return an error if item exists in the correct table and column", () => {
    return checkExists("reviews", "review_id", 1).then((output) => {
      expect(output).toBe(undefined);
    });
  });
  test("returns a rejected promise with an error if item is valid but does not exist in the correct table and column", () => {
    return checkExists("reviews", "review_id", 10000).catch((error) => {
      expect(error).toEqual({
        status: 404,
        msg: "Resource not found in the database",
      });
    });
  });
});
