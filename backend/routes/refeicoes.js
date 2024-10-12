const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();
const jwt = require("jsonwebtoken");
const {authenticateToken} = require("./validations");
require('dotenv').config();

// Connect to SQLite Database
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
      console.error(process.env.ERROR_DB_CONNECT, err.message);
    }
  });

// GET ALL REFEIÇÕES
router.get("/", authenticateToken, (req, res) => {
    
    db.all("SELECT * from Meals", [], async (err, rows) => {
        if (err) {
            return res.status(500).json({ "Error fetching from database: ": err.message })
        }
        if(rows.length === 0) {
            return res.status(404).json({ "message": "No meals found" });
        }
        res.json(rows);
    });
});

//GET REFEIÇÃO BY ID
router.get("/:id", (req, res) => {

    const refId = req.params.id;
    db.get("SELECT * from Meals WHERE id = ?", [refId], async (err, rows) => {
        if (err) {
            return res.status(500).json({ "Error fetching from database: ": err.message })
        }
        if(!rows) {
            return res.status(202).json({ "message": "No meals found" });
        }
        res.json(rows);
    });
});

//ADICIONAR REFEIÇÃO
router.post("/", authenticateToken, (req, res) => {

    //Adaptar o nome das variáveis ao frontend
    const { name , description } = req.body;
    const sql = "INSERT INTO Meals (name, description, status) VALUES ( ?, ?, 1)";

    db.run(sql, [name, description] , (err) => {
        if (err) {
            return res.status(500).json({ error: err.message })
        }
        res.status(201).json({ message: "Refeição adicionada com sucesso" });
    });
});

//UPDATE REFEIÇÃO
router.put("/:id", authenticateToken, (req, res) => {
    const id = req.params.id;

    //Adaptar o nome das variáveis ao frontend
    const { name , description , status }= req.body;

    const sql = "UPDATE Meals SET name = ?, description = ?, status = ? WHERE id = ?";

    db.run(sql, [name , description , status, id], function (err) {
        if (err) {
            return res.status(500).json({ "Error updating DB: ": err.message })
        }
        if (this.changes > 0) {
            return res.status(200).json({ message: "Meal updated successfully."});
        } else {
            return res.status(404).json({ message: "Meal not found."})
        }

    });
});

//ENABLE REFEIÇÃO
router.put("/:id/enable", authenticateToken, (req, res) => {
    const id = req.params.id;

    const sql = "UPDATE Meals SET status = 1 WHERE id = ?";
    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(500).json({ "Error updating meal" : err.message })
        }
        return res.status(202).json({ message : "Meal enabled."})
    });
});


//DISABLE REFEIÇÃO
router.put("/:id/disable", authenticateToken, (req, res) => {
    const id = req.params.id;

    const sql = "UPDATE Meals SET status = 0 WHERE id = ?";
    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(500).json({ "Error updating meal" : err.message })
        }
        return res.status(202).json({ message : "Meal disabled."})
    });
});



module.exports = router;