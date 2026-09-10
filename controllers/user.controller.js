import mongoose from "mongoose";
import User from "../models/user.model.js";
import { createUser } from "../services/user.service.js";
import { validationResult } from "express-validator";
import BlacklistToken from "../models/blacklistToken.model.js";

const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // const existingUser = await User.findOne({ email });
        // if (existingUser) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "User already exists"
        //     });
        // }

        const user = await createUser({ firstName, lastName, email, password });

        const token = user.generateToken();

        res.status(201).cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,// 1 day
            sameSite: "none",
        }).json({
            success: true,
            user,
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        const token = user.generateToken();
        res.status(200).cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: "none",
        }).json({
            success: true,
            user,
            token
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = req.user
        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const logout = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not logged in"
            });
        }

        // Add the token to the blacklist
        await BlacklistToken.create({ token });

        // Clear the token cookie
        res.clearCookie("token");

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export { register, login, getUserProfile, logout };