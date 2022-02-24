const {ApolloError} = require("apollo-server-errors");
const User = require("../models/user.model");
const {
  isVerificationTokenExpired,
  decrypt,
  generateVerificationUrl,
  comparePassword,
  generateJwt,
  sendAccountVerificationEmail,
} = require("../utils");

const resolvers = {
  Query: {
    async users() {
      return User.find({});
    },
  },

  Mutation: {
    async register(_, args) {
      const existingUser = await User.findOne({email: args.email});
      if (existingUser) return new ApolloError("User already exists!!", "409");

      const newUser = await User.create(args);
      return newUser;
    },

    async login(parent, args) {
      const {email, password} = args;

      const user = await User.findOne({email});

      if (!user) return new ApolloError("User not found!!", 404);

      if (!user.isVerified)
        return new ApolloError("User is not verified. Please check your email for verification", 403);

      const passwordMatch = comparePassword(password, user.password);
      if (!passwordMatch) throw new ApolloError("Invalid credentials", 400);

      const payload = {
        id: user._id,
        email: user.email,
      };
      const token = generateJwt(payload);

      return {token, user};
    },

    async verifyEmail(parent, args) {
      const {token} = args;

      if (isVerificationTokenExpired(token))
        return new ApolloError("Verification token expired. Please try again.", "422");

      const decryptedToken = decrypt(token);
      const {userId} = decryptedToken;

      const user = await User.findById(userId);

      if (!user) return new ApolloError("User does not exist", "404");

      await User.findByIdAndUpdate(user.id, {isVerified: true});

      return "Email verification successful";
    },

    async resendVerificationEmail(parent, args) {
      const {token} = args;
      const decryptedToken = decrypt(token);
      const {userId} = decryptedToken;

      const user = await User.findById(userId);
      if (!user) return new ApolloError("User does not exist", "404");

      const verificationUrl = generateVerificationUrl(user.id);

      const emailPayload = {
        reciepients: user.email,
        templateVariables: {
          verificationUrl,
        },
      };
      await sendAccountVerificationEmail(emailPayload);
      return "Verification Email sent successfully";
    },
  },
};

module.exports = {resolvers};
