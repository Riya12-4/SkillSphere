const Razorpay = require("razorpay");

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log("Razorpay Key ID:", keyId ? `${keyId.substring(0, 12)}...` : "MISSING");
console.log("Razorpay Key Secret:", keySecret ? "LOADED" : "MISSING");

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

module.exports = razorpay;