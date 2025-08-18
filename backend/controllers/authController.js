import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//generate JWT Token
const generateToken = (userId) => {
    return jwt. sign ({id: userId}, process.env.JWT_SECRET, {expiresIn: "7d"});
};

// @desc Register a new user
// @route POST /api/users
// @access Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl, adminInviteToken } = req.body;

        //check if user already exists
        const userExists = await User.findOne({email});
        if (userExists) {
            return res.status(400).json({message: "User already exists"});
        }

        //Determine User Role: Admin if correct token is provided, otherwise Member
        let role = "member";
        if (adminInviteToken && adminInviteToken == process.env.ADMIN_INVITE_TOKEN) {
            role = "admin";
        }

        //Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //Create User
        const user = await User.create({
            name, 
            email, 
            password: hashedPassword, 
            role, 
            profileImageUrl});

        
        //Return User Data with JWT
        res.status(201).json({
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            profileImageUrl: user.profileImageUrl, 
            token: generateToken(user._id), //Generate JWT Token
        });
    } catch (error) {
        res.status(500).json({message: "Server Error Registering User", error: error.message});
    }
}

// @desc Log in a user  
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        //Check if user exists
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: "Invalid Credentials"});
        }

        //Check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({message: "Invalid Credentials"});
        }

        //Return User Data with JWT
        res.status(200).json({
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            profileImageUrl: user.profileImageUrl, 
            token: generateToken(user._id), //Generate JWT Token
        });
    } catch (error) {
        res.status(500).json({message: "Server Error Logging In", error: error.message});
    }
}

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private (requires JWT)
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({message: "User Not Found"});
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: "Server Error Getting User Profile", error: error.message});
    }
}

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private (requires JWT)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({message: "User Not Found"});
        }

        //Update User Data
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.profileImageUrl = req.body.profileImageUrl || user.profileImageUrl;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            user.password = hashedPassword;
        }

        //Save User
        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id, 
            name: updatedUser.name, 
            email: updatedUser.email, 
            role: updatedUser.role, 
            profileImageUrl: updatedUser.profileImageUrl, 
            token: generateToken(updatedUser._id), //Generate JWT Token
        });
    } catch (error) {
        res.status(500).json({message: "Server Error", error: error.message});
    }
}

export { registerUser, loginUser, getUserProfile, updateUserProfile };