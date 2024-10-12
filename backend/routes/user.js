const express = require("express");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const router = express.Router();
const {authenticateToken} = require("./validations");
require('dotenv').config(); // .env
require('dotenv').config({ path: './.config' }); //.config

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const SECRET_KEY = process.env.LOGIN_ENCRYPT_KEY;
const JWT_SIGN_TIME = process.env.JWT_SIGN_TIME;

const ERROR_DB_CODE = parseInt(process.env.ERROR_DB_CODE);
const ERROR_DB_CONNECT = process.env.ERROR_DB_CONNECT;
const ERROR_DB_OCCURRED = process.env.ERROR_DB_OCCURRED;
const ERROR_DB_FETCH = process.env.ERROR_DB_FETCH;
const ERROR_DB_UPDATE = process.env.ERROR_DB_UPDATE;
const ERROR_BD_DELETE = process.env.ERROR_BD_DELETE;

// Connect to SQLite Database
const db = new sqlite3.Database("database.db", (err) => {
    if (err) {
        console.error(ERROR_DB_CONNECT, err.message);
    }
});

// Get User by email
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM Users WHERE email = ? AND status = 1", [email], async (err, user) => {
        if (err) {
            return res.status(ERROR_DB_CODE).json({ error: err.message });
        }

        if (!user) {
            // If the user is not found
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // If the login is successful, create a JWT token
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: JWT_SIGN_TIME});

        res.json({ message: "Login successful", token });
    });
});

// Create a new User
router.post("/register", async (req, res) => {
    const { name, password, email } = req.body;
    const sql = "INSERT INTO Users (name, email, password) VALUES (?, ?, ?)";

    // Check if the User exists in the database
    db.get("SELECT * FROM Users WHERE name = ? or email = ?", [name, email], (err, user) => {
        if (err) {
            return res.status(ERROR_DB_CODE).json({ error: ERROR_DB_OCCURRED });
        }

        if (user) {
            // If the user is found
            return res.status(401).json({ message: "There is already a user with those credentials" });
        }
    });
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    db.run(sql, [name, email, hashedPassword], function (err) {
        if (err) {
            return res.status(ERROR_DB_CODE).json({ error: err.message });

        }
        else {
            return res.status(201).json({ id: this.lastID });
        }
    });
});

// GET ALL USERS
router.get('/', authenticateToken, (req, res) => {
    const users = "SELECT id, name, email, role, status FROM Users";

    db.all(users, [], async (err, rows) => {
        if (err) {
            return res.status(ERROR_DB_CODE).json({ ERROR_DB_OCCURRED: err.message });
        }

        if (rows.length > 0) {
            return res.status(200).json({ data: rows });
        } else {
            return res.status(200).json({ message: "No users found. " });
        }
    });
});

// GET USER
router.get('/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const query = "SELECT id, name, email, role, status FROM Users WHERE id = ?";

    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(ERROR_DB_CODE).json({ ERROR_DB_FETCH: err.message });
        }
        if (row) {
            return res.status(200).json({ data: row });
        } else {
            return res.status(404).json({ message: "User not found." });
        }
    })
});

// UPDATE USER
router.put('/:id', authenticateToken, async (req, res) => {
    const id = req.params.id;
    const { name, email, password, role, status } = req.body;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    if (!name || !email || !password || !role || !status) {
        return res.status(400).json({ message: "All fields (name, email, password, role, status) are required" });
    }

    const query = "UPDATE Users SET name = ?, email = ?, password = ?, role = ?, status = ? WHERE id = ?";
    db.run(query, [name, email, hashedPassword, role, status, id], function (err) {
        if (err) {
            return res.status(ERROR_DB_CODE).json({ ERROR_DB_UPDATE: err.message });
        }
        if (this.changes > 0) {
            return res.status(200).json({ message: "User updated" });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    });
});

// DELETE USER
router.delete('/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const query = "DELETE FROM Users WHERE id = ?";
    db.run(query, [id], function (err) {
        if (err) {
            return res.status(ERROR_DB_CODE).json({ ERROR_BD_DELETE: err.message });
        }
        if (this.changes > 0) {
            return res.status(200).json({ message: "User deleted" });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    });
});

// DISABLE USER 
router.put("/:id/disable", authenticateToken, (req, res) => {
    const id = req.params.id;
    const query = "UPDATE Users SET status = 0 WHERE id = ?";

    db.run(query, [id], function (err) {
        if (err) {
            return res.status(ERROR_DB_CODE).json({ "Error updating user": err.message })
        }
        return res.status(202).json({ message: "User disabled." })
    });
});

// ENABLE USER 
router.put("/:id/enable", authenticateToken, (req, res) => {
    const id = req.params.id;
    const query = "UPDATE Users SET status = 1 WHERE id = ?";

    db.run(query, [id], function (err) {
        if (err) {
            return res.status(ERROR_DB_CODE).json({ "Error updating user": err.message })
        }
        return res.status(202).json({ message: "User enabled." })
    });
});

module.exports = router;