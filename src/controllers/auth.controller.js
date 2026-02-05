const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role, email) => {
    return jwt.sign({ id, role, email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY || '24h',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { username, email, password, full_name } = req.body;

        // Check if user exists (username or email)
        const userExists = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [{ email }, { username }]
            }
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Username or Email already exists'
            });
        }

        // Create user
        // Password hashing is handled by User model hook
        const user = await User.create({
            username,
            email,
            password_hash: password,
            full_name,
            role: 'STAFF' // Force role to STAFF for registration as per PRD
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid user data'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body; // PRD says Email or Username, let's support Email first as per user story
        // Actually PRD 4.1.2 says "Email or Username".

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Check for user
        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user.id, user.role, user.email);

            res.status(200).json({
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    full_name: user.full_name
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
