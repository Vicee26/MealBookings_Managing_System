const express = require("express");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();
require("dotenv").config();

const SECRET_KEY = process.env.LOGIN_ENCRYPT_KEY;

const ERROR_DB_CODE = parseInt(process.env.ERROR_DB_CODE);

// Connect to SQLite Database
const db = new sqlite3.Database("database.db", (err) => {
  if (err) {
      console.error(ERROR_DB_CONNECT, err.message);
  }
});


// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(authHeader, token);

  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user.userId; // Store the decoded user information (including user_id) in req.user
    next();
  });
  
}

function checkAdminRole(req, res, next) {
  db.get("SELECT * FROM Users WHERE id= ?", [req.user], async (err, user) => {
    if (err) {
      return res.status(ERROR_DB_CODE).json({ error: err.message });
    }

    if (!user) {
      // If the user is not found
      return res.status(401).json({ message: "User Not Found" });
    }


    if (user.role != 1) {
      return res.status(403).json({ message: "Invalid Credentials" })
    }

    res.status(201).json({ message: "Validation Succeded" });
    next();
  });
}

// Verify token
router.post("/token", authenticateToken, () => { });

router.post("/admin", authenticateToken, checkAdminRole, () => { });

module.exports = router;
module.exports.authenticateToken = authenticateToken;