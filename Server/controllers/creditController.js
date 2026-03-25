import Transaction from "../models/Transaction.js";
import Stripe from "stripe";

// ✅ Stripe initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Available Plans
const plans = [
  {
    _id: "basic",
    name: "Basic",
    price: 10,
    credits: 100,
    features: [
      "100 text generations",
      "50 image generations",
      "Standard support",
      "Access to basic models",
    ],
  },
  {
    _id: "pro",
    name: "Pro",
    price: 20,
    credits: 500,
    features: [
      "500 text generations",
      "200 image generations",
      "Priority support",
      "Access to pro models",
      "Faster response time",
    ],
  },
  {
    _id: "premium",
    name: "Premium",
    price: 30,
    credits: 1000,
    features: [
      "1000 text generations",
      "500 image generations",
      "24/7 VIP support",
      "Access to premium models",
      "Dedicated account manager",
    ],
  },
];

// ✅ Get All Plans
export const getPlans = async (req, res) => {
  try {
    res.json({ success: true, plans });
  } catch (error) {
    console.error("Get Plans Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Purchase Plan
export const purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;

    // ✅ Validate user from middleware
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized user" });
    }

    // ✅ Validate plan
    const plan = plans.find((plan) => plan._id === planId);
    if (!plan) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    // ✅ Create transaction record
    const transaction = await Transaction.create({
      userId,
      planId: plan._id,
      amount: plan.price,
      credits: plan.credits,
      isPaid: false,
    });

    const origin = req.headers.origin || process.env.CLIENT_URL || "http://localhost:3000";

    // ✅ Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.price * 100,
            product_data: { name: plan.name },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        transactionId: transaction._id.toString(),
        appId: "quickgpt",
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min expiry
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};