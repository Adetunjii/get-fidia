const {gql} = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    phoneNumber: String!
    country: String!
  }

  type Query {
    users: [User!]!
  }

  type Login {
    token: String!
    user: User!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, phoneNumber: String!, country: String!): User!
    login(email: String!, password: String!): Login!
    verifyEmail(token: String!): String!
    resendVerificationEmail(token: String!): String!
  }
`;

module.exports = {typeDefs};
