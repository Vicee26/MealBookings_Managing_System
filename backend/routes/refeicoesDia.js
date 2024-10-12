const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();
const {authenticateToken} = require("./validations");
require('dotenv').config();

// Connect to SQLite Database
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error(process.env.ERROR_DB_CONNECT, err.message);
    }
});

function isDateValid(mealDate) {
    const currentDate = new Date();
    const validDate = new Date(mealDate);
    // Set time to midnight for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    validDate.setHours(0, 0, 0, 0);

    // Check if the current date is before the valid date
    return currentDate < validDate;
}


// GET DAY MEALS BY DATE
router.get('/:date', authenticateToken, (req, res) => {
    const date = req.params.date;
    const sql = `SELECT Day_Meals.*, Meals.name, Meals.description 
        FROM Day_Meals 
        JOIN Meals ON Day_Meals.meal_id = Meals.id 
        WHERE Day_Meals.date = ?`;

    db.all(sql, [date], (err, rows) => {
        if (err) {
            return res.status(500).json({ "Error retrieving data": err.message });
        }
        if (rows.length === 0) {
            return res.status(202).json({ message: "No meals booked for the selected day." });
        }
        return res.status(200).json({ meals: rows });
    });
});


// ADD DAILY MEAL (Select a meal(meal_id) from 'Meals' and add to 'Day_Meals')
router.post("/day-meal", authenticateToken, async (req, res) => {
    const { meal_id, type, date } = req.body;

    // Validate required fields
    if (!meal_id || !type || !date) {
        return res.status(400).json({ message: "Meal ID, type, and date are required." });
    }

    // Allowed meal types
    const allowedTypes = ["Meat", "Fish", "Diet", "Other"];
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid meal type. Allowed values are 'Meat', 'Fish', 'Diet', 'Other'." });
    }

    if (!isDateValid(date)) {
        return res.status(400).json({ message: "Cannot add meal because it must be done at least one day before the meal date." });
    }

    // Check if the meal exists in 'Meals' table
    const checkMealSql = "SELECT * FROM Meals WHERE id = ?";
    db.get(checkMealSql, [meal_id], (err, meal) => {
        if (err) {
            return res.status(500).json({ message: "Error retrieving meal", error: err.message });
        }
        if (!meal) {
            return res.status(404).json({ message: "Meal not found" });
        }

        // If meal exists, insert into 'Day_Meals' table
        const insertDayMealSql = "INSERT INTO Day_Meals (meal_id, type, date) VALUES (?, ?, ?)";
        db.run(insertDayMealSql, [meal_id, type, date], function (err) {
            if (err) {
                return res.status(500).json({ message: "Error adding daily meal", error: err.message });
            }
            return res.status(201).json({ message: "Daily meal added successfully", id: this.lastID });
        });
    });
});


// UPDATE DAILY MEAL
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params; // daily meal ID
    const { type, meal_id, date } = req.body;

    const allowedTypes = ["Meat", "Fish", "Diet", "Other"];

    // Validate meal type
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid type. Allowed values are 'Meat', 'Fish', 'Diet', 'Other'." });
    }

    // Validate meal_id and date
    if (!meal_id || !date || !type) { // Ensure user_id is present
        return res.status(400).json({ message: "Meal ID, date, and type are required." });
    }

    // Date validation function call
    if (!isDateValid(date)) {
        return res.status(400).json({ message: "Cannot update meal because it must be done at least one day before the meal date." });
    }
    //CHECK IF A BOOKING IS MADE FOR THIS DAY MEAL (DENY UPDATE IF BOOKING IS MADE)
    const checkBookingsSql = `SELECT * FROM Bookings WHERE day_meals_id = ?`;
        db.all(checkBookingsSql, [id], (err, bookings) => {
            if (err) {
                return res.status(500).json({ message: "Error updating bookings.", error: err.message });
            }
            if (bookings.length > 0) {
                return res.status(400).json({ message: "Cannot update meal because there are existing bookings." });
            }

            if (!isDateValid(meal.date)) {
                return res.status(400).json({ message: "Cannot update meal because it must be done at least one day before the meal date." });
            }
        });

        try {
            const checkSql = `
            SELECT COUNT(*) as count 
            FROM Bookings b
            JOIN Day_Meals dm ON b.day_meals_id = dm.id
            WHERE dm.id = ? AND dm.date = ?
        `;
            const checkParams = [id, date];
    
            db.get(checkSql, checkParams, (err, row) => {
                if (err) {
                    return res.status(500).json({ message: "Error checking booking.", error: err.message });
                }
    
                // Proceed with the update
                const sql = `UPDATE Day_Meals SET type = ?, meal_id = ?, date = ? WHERE id = ?`;
                db.run(sql, [type, meal_id, date, id], function (err) {
                    if (err) {
                        return res.status(500).json({ message: "Error updating meal marking.", error: err.message });
                    }
                    if (this.changes === 0) {
                        return res.status(404).json({ message: "Meal marking not found." });
                    }
                    return res.status(200).json({ message: "Meal marking updated successfully" });
                });
            });
        } catch (error) {
            return res.status(500).json({ message: "Server error.", error: error.message });
        }

    
});


// DELETE DAY MEAL (ONLY IF THERE ARE NO BOOKINGS)
router.delete('/day-meal/:id', authenticateToken, async (req, res) => {
    const id = req.params.id; // Get the ID of the daily meal to delete

    // Check if the daily meal exists
    const checkMealSql = `SELECT * FROM Day_Meals WHERE id = ?`;
    db.get(checkMealSql, [id], (err, meal) => {
        if (err) {
            return res.status(500).json({ message: "Error checking daily meal.", error: err.message });
        }
        if (!meal) {
            return res.status(404).json({ message: "Daily meal not found." });
        }

        // Check for bookings associated with the daily meal
        const checkBookingsSql = `SELECT * FROM Bookings WHERE day_meals_id = ?`;
        db.all(checkBookingsSql, [id], (err, bookings) => {
            if (err) {
                return res.status(500).json({ message: "Error checking bookings.", error: err.message });
            }
            if (bookings.length > 0) {
                return res.status(400).json({ message: "Cannot delete meal because there are existing bookings." });
            }

            if (!isDateValid(meal.date)) {
                return res.status(400).json({ message: "Cannot delete meal because it must be done at least one day before the meal date." });
            }

            // If no bookings exist, delete the daily meal
            const deleteMealSql = `DELETE FROM Day_Meals WHERE id = ?`;
            db.run(deleteMealSql, [id], function (err) {
                if (err) {
                    return res.status(500).json({ message: "Error deleting daily meal.", error: err.message });
                }
                return res.status(200).json({ message: "Daily meal deleted successfully." });
            });
        });
    });
});

module.exports = router;