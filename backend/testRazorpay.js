require("dotenv").config();

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testRazorpay() {
  try {
    const order = await razorpay.orders.create({
      amount: 50000,
      currency: "INR",
      receipt: `test_${Date.now()}`,
    });

    console.log("✅ Razorpay Working!");
    console.log(order);
  } catch (error) {
    console.log("❌ Razorpay Test Failed");
    console.log(error);
  }
}

testRazorpay();