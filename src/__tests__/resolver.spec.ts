const {resolvers} = require("../graphQL");
const userModel = require("../models/user.model");

let mockUser = {
  id: "6217ce690e407ef375d89e69",
  name: "Adetunji",
  email: "adetunjithomas1@gmail.com",
  password: "password",
  phoneNumber: "08143091839",
  country: "Nigeria",
  isVerified: false,
};

describe("Resolvers", () => {
  beforeAll(async () => {
    jest.spyOn(userModel, "find").mockResolvedValue([mockUser]);

    jest.spyOn(userModel, "findOne").mockResolvedValue(mockUser);

    jest.spyOn(userModel, "findById").mockResolvedValue(mockUser);

    jest.spyOn(userModel, "create").mockResolvedValueOnce(mockUser);
  });

  it("should fetch all users", async () => {
    const users = await resolvers.Query.users();

    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "6217ce690e407ef375d89e69",
          name: "Adetunji",
          email: "adetunjithomas1@gmail.com",
          phoneNumber: "08143091839",
          country: "Nigeria",
          isVerified: false,
        }),
      ])
    );
  });

  it("should throw a 'User already exists!!' error", async () => {
    const payload = {
      name: "Adetunji",
      email: "adetunjithomas1@gmail.com",
      password: "password",
      phoneNumber: "08143091839",
      country: "Nigeria",
    };
    const response = await resolvers.Mutation.register(null, payload);

    expect(response.message).toBe("User already exists!!");
  });

  it("should not login an unverified user", async () => {
    const args = {email: "adetunjithomas1@gmail.com", password: "password"};

    const loginResponse = await resolvers.Mutation.login(null, args);

    expect(loginResponse.message).toBe("User is not verified. Please check your email for verification");
  });

  it("should not verify a user with an expired verification token", async () => {
    const args = {
      token:
        "41dac0d8a8ad26b88459cd093cc2067c797d7161b35955e805fb89d057eb819b500fc392cc68f06dec2aa29c9990c8407ab0521606d7d5e73d17d328d695ef9a",
    };

    const response = await resolvers.Mutation.verifyEmail(null, args);
    expect(response.message).toEqual("Verification token expired. Please try again.");
  });

  it("should login a verified user", async () => {
    mockUser.isVerified = true;
    jest.spyOn(userModel, "findOne").mockResolvedValue(mockUser);

    const args = {email: "adetunjithomas1@gmail.com", password: "password"};
    const loginResponse = await resolvers.Mutation.login(null, args);

    expect(loginResponse).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: mockUser,
      })
    );
  });

  it("should register a user", async () => {
    jest.spyOn(userModel, "findOne").mockResolvedValue(null);

    const payload = {
      name: "Adetunji",
      email: "adetunjithomas1@gmail.com",
      password: "password",
      phoneNumber: "08143091839",
      country: "Nigeria",
    };
    const newUser = await resolvers.Mutation.register(null, payload);

    expect(newUser.name).toBe("Adetunji");
  });
});
