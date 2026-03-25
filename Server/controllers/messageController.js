// controllers/messageController.js
import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import openai from "../configs/openai.js";

// Text message controller
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { chatId, prompt } = req.body;

    // Check credits
    if (req.user.credits < 1) {
      return res.json({ success: false, message: "You don't have enough credits" });
    }

    // Find chat or create if not found
    let chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      chat = await Chat.create({
        userId,
        userName: req.user.name,
        name: "New Chat",
        messages: [],
      });
    }

    // Push user message
    chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false });

    // Call OpenAI Gemini
    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false };

    chat.messages.push(reply);
    await chat.save();

    // Deduct one credit
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

    res.json({ success: true, reply, chatId: chat._id });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Image message controller
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { chatId, prompt, isPublished } = req.body;

    // Check credits
    if (req.user.credits < 2) {
      return res.json({ success: false, message: "You don't have enough credits" });
    }

    // Find chat or create if not found
    let chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      chat = await Chat.create({
        userId,
        userName: req.user.name,
        name: "New Chat",
        messages: [],
      });
    }

    // Push user message
    chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false });

    // Encode prompt for ImageKit
    const encodedPrompt = encodeURIComponent(prompt);
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    // Fetch AI image with timeout
    let aiImageResponse;
    try {
      aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer", timeout: 20000 });
    } catch (err) {
      return res.json({ success: false, message: "ImageKit AI service unavailable or timed out. Try again later." });
    }

    // Convert to Base64
    const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`;

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "quickgpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    chat.messages.push(reply);
    await chat.save();

    // Deduct 2 credits
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });

    res.json({ success: true, reply, chatId: chat._id });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


