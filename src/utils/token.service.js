const {createCipheriv, createDecipheriv} = require("crypto");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const algorithm = "aes-192-cbc";
const iv = Buffer.from(process.env.INIT_VECTOR, "hex");
const key = Buffer.from(process.env.SECRET_KEY, "hex");

/**
 * The whole idea here is to create stateless verification tokens
 * instead of having to store them in the database since they're short-lived
 * @function encrypt - encrypts data using 'aes-192-cbc' algorithm
 * @param {*} data - contains userId and expiry time for the token
 * @returns string
 */
const encrypt = (data) => {
  data = JSON.stringify(data);
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  console.log(encrypted);
  return encrypted;
};

/**
 * @function decrypt - decrypts the token to get back the data stored in it
 * @param {*} hash - string
 * @returns
 */
const decrypt = (hash) => {
  const decipher = createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(hash, "hex", "utf8");
  decrypted += decipher.final("utf8");
  decrypted = JSON.parse(decrypted);
  return decrypted;
};

/**
 * @function generateVerificationUrl - Generate a link with the verification token that's valid for 10 minutes
 * @param {*} userId
 * @returns string
 */
const generateVerificationUrl = (userId) => {
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + 600, // set expiry to 10 minutes
  };

  const verificationToken = encrypt(payload);
  const verificationUrl = "http://localhost:4000/verify?" + verificationToken;

  return verificationUrl;
};

/**
 * @function isVerificationTokenExpired - Checks if the token provided is valid
 * @param {*} token
 * @returns boolean
 */
const isVerificationTokenExpired = (token) => {
  let decrypted = decrypt(token);
  const currentTimeStamp = Math.floor(Date.now() / 1000);

  if (currentTimeStamp >= decrypted.exp) {
    return true;
  }

  return false;
};

const generateJwt = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "12h",
    issuer: "https://getfidia.com",
  });
};

const verifyJwt = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
    if (error) return error;
    return decoded;
  });
};

module.exports = {
  decrypt,
  generateVerificationUrl,
  isVerificationTokenExpired,
  generateJwt,
  verifyJwt,
};
