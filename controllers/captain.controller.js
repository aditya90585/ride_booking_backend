import BlacklistToken from "../models/blacklistToken.model.js";
import Captain from "../models/captain.model.js";
import { createCaptain } from "../services/captain.service.js";
import { validationResult } from "express-validator";

const registerCaptain = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
        }
   
        const { firstName, lastName, email, password, color, plate, capacity, vehicleType } = req.body;
        const captain = await createCaptain({ firstName, lastName, email, password, color, plate, capacity, vehicleType });

        const token = await captain.generateToken()

        res.status(201).json({ success: true, captain, token });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const loginCaptain = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;

        const captain = await Captain.findOne({ email }).select("+password");
        if (!captain) {
            return res.status(404).json({
                success: false,
                message: "Captain not found"
            });
        }
        const isMatch = await captain.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = captain.generateToken();

        res.status(200).cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }).json({
            success: true,
            captain,
            token
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getCaptainProfile = async (req, res) => {
    try {
        const captain = req.captain
        res.status(200).json({
            success: true,
            captain,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


const logoutCaptain = async (req, res) => {
    try {
        const token  = req.cookies.token || req.headers.authorization?.split(" ")[1];

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

export { registerCaptain,loginCaptain,getCaptainProfile,logoutCaptain };