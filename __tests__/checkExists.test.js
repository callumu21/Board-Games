const { checkExists } = require("../utils/checkExists");

describe("checkExists function", () => {
  test("does not return a promise if item exists in the correct table and column", () => {
    return checkExists("reviews", "review_id", 1).then((output) => {
      expect(output).not.toBeInstanceOf(Promise);
    });
  });
  test("returns a rejected promise if item is valid but does not exist in the correct table and column", () => {
    return checkExists("reviews", "review_id", 10000).catch((error) => {
      expect(error).toEqual({
        status: 404,
        msg: "Resource not found in the database",
      });
    });
  });
});
