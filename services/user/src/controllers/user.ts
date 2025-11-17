import User from "../model/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import TryCatch from "../utils/TryCatch.js";
import { type AuthenticatedRequest } from "../middleware/isAuth.js";

export const registerUser = TryCatch(async (req, res) => {
  const { name, email, password, image } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      message: "Name, email, and password are required",
    });
    return;
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400).json({
      message: "User with this email already exists",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    image: image || "https://via.placeholder.com/150",
  });

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "5d",
  });

  res.status(201).json({
    message: "User registered successfully",
    token,
    user,
  });
});

export const loginUser = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message: "Email and password are required",
    });
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).json({
      message: "Invalid email or password",
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({
      message: "Invalid email or password",
    });
    return;
  }

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "5d",
  });

  res.status(200).json({
    message: "Login success",
    token,
    user,
  });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  res.json(user);
});

export const getUserProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({
      message: "No user with this id",
    });
    return;
  }

  res.json(user);
});

export const updateUser = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { name, instagram, facebook, linkedin, bio } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      name,
      instagram,
      facebook,
      linkedin,
      bio,
    },
    { new: true }
  );

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "5d",
  });

  res.json({
    message: "User Updated",
    token,
    user,
  });
});
