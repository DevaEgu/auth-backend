const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.signUp = async (req, res) => {
  const { email, password, fullName, isUstaz } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      isUstaz: Boolean(isUstaz),
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({ message: "User registered", token });
  } catch (error) {
    res.status(500).json({ message: "Sign-up failed", error: error.message });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Logged in",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        isUstaz: user.isUstaz,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.signInWithGoogle = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name: fullName, picture } = payload;

    // 1. Find user by googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // 2. If not found, check if user with same email exists
      user = await User.findOne({ email });

      if (user) {
        // 3. Link Google login to existing user
        user.googleId = googleId;
        if (!user.avatar) user.avatar = picture;
        await user.save();
      } else {
        // 4. No user exists with this email -> create new user
        user = new User({
          googleId,
          email,
          fullName,
          avatar: picture,
        });
        await user.save();
      }
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Google login successful",
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        isUstaz: user.isUstaz,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
};
