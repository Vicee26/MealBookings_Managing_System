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

function isDateValid(mealDate) {
    const currentDate = new Date();
    const validDate = new Date(mealDate);
    // Set time to midnight for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    validDate.setHours(0, 0, 0, 0);
    
    // Check if the current date is before the valid date
    return currentDate < validDate;
}



// GET ALL BOOKINGS
router.get('/index', authenticateToken, (req, res) => {
    
    const sql = `
        SELECT 
            Bookings.*, 
            Day_Meals.type AS meal_type, 
            Meals.name AS meal_name, 
            Meals.description AS meal_description,
            Day_Meals.date AS meal_date
        FROM 
            Bookings 
        JOIN 
            Day_Meals ON Bookings.day_meals_id = Day_Meals.id 
        JOIN 
            Meals ON Day_Meals.meal_id = Meals.id
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ "Error retrieving data": err.message });
        }
        if (rows.length === 0) {
            return res.status(202).json({ message: "No bookings found." });
        }
        return res.status(200).json({ bookings: rows });
    });
});


//ADD BOOKING
router.post('/', authenticateToken, async (req, res) => {
    const { user_id, day_meals_id, booking_schedule } = req.body;
    let new_user_id
    if(user_id == null){
         new_user_id = req.user;
    }else{
        new_user_id = user_id;
    }
    console.log(new_user_id);
    if (!new_user_id || !day_meals_id || booking_schedule == null) {
        return res.status(400).json({ message: "User ID, Day Meals ID, and booking schedule are required." });
    }

    try {
        // Fetch the meal date associated with the day_meals_id
        const mealDateQuery = `SELECT date FROM Day_Meals WHERE id = ?`;
        db.get(mealDateQuery, [day_meals_id], (err, meal) => {
            if (err) {
                return res.status(500).json({ message: "Error retrieving meal date.", error: err.message });
            }
            if (!meal) {
                return res.status(404).json({ message: "Day meal not found." });
            }

            // Check if the current date is valid for adding a booking
            if (!isDateValid(meal.date)) {
                return res.status(400).json({ message: "Cannot add booking; it must be done at least one day before the meal date." });
            }

            // If the date is valid, proceed to add the booking
            const sql = `INSERT INTO Bookings (user_id, day_meals_id, booking_schedule) VALUES (?, ?, ?)`;
            db.run(sql, [new_user_id, day_meals_id, booking_schedule], function (err) {
                if (err) {
                    return res.status(500).json({ message: "Error adding booking.", error: err.message });
                }
                return res.status(201).json({ message: "Booking added successfully", id: this.lastID });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
});




//GET BOOKINGS BY DATE
router.get('/index/:date', authenticateToken, (req, res) => {
    const date  = req.params.date; // Get the date from query parameters
    
    // Validate the date parameter
    if (!date) {
        return res.status(400).json({ message: "Date parameter is required." });
    }

    // SQL query to fetch bookings along with meal details for the specified date
    const sql = `
        SELECT 
            Bookings.*, 
            Day_Meals.type AS meal_type, 
            Meals.name AS meal_name, 
            Meals.description AS meal_description 
        FROM 
            Bookings 
        JOIN 
            Day_Meals ON Bookings.day_meals_id = Day_Meals.id 
        JOIN 
            Meals ON Day_Meals.meal_id = Meals.id 
        WHERE 
            Day_Meals.date = ?;  -- Using a parameterized query for safety
    `;

    db.all(sql, [date], (err, rows) => {
        if (err) {
            return res.status(500).json({ "Error retrieving data": err.message });
        }
        if (rows.length === 0) {
            return res.status(202).json({ message: "No bookings found for the specified date." });
        }
        return res.status(200).json({ bookings: rows });
    });
});


// update booking by id for user 
router.put('/put/:id', authenticateToken, async (req, res)=>{
    const {day_meals_id , booking_schedule} = req.body;
    const id = req.params.id;

    const sql = `
    UPDATE bookings
    SET 
        day_meals_id = ?,
        booking_schedule = ?
    WHERE id = ?;
    `;

    db.run(sql, [day_meals_id, booking_schedule, id], (err) => {
        if (err) {
            return res.status(500).json({ "Error updating booking": err.message });
        }
        return res.status(200).json({ message: "Booking updated successfully" });
    });

});



// UPDATE BOOKING BY ID
router.put('/:id', authenticateToken ,async (req, res) => {
    const { id } = req.params;
    const { user_id, day_meals_id, booking_schedule } = req.body;

    // Validate request body
    if (!user_id || !day_meals_id || !booking_schedule) {
        return res.status(400).json({ message: "User ID, Day Meals ID, and booking schedule are required." });
    }

    try {
        // Check if booking exists
        const checkSql = `SELECT * FROM Bookings WHERE id = ?`;
        db.get(checkSql, [id], (err, row) => {
            if (err) {
                return res.status(500).json({ message: "Error checking booking.", error: err.message });
            }
            if (!row) {
                return res.status(404).json({ message: "Booking not found." });
            }

            // Fetch the meal date associated with the current booking
            const mealDateQuery = `SELECT date FROM Day_Meals WHERE id = ?`;
            db.get(mealDateQuery, [row.day_meals_id], (err, meal) => {
                if (err) {
                    return res.status(500).json({ message: "Error retrieving meal date.", error: err.message });
                }
                if (!meal) {
                    return res.status(404).json({ message: "Current meal not found." });
                }

                // Check if the new day_meals_id is available for the same date
                const checkNewMealQuery = `
                    SELECT COUNT(*) as count 
                    FROM Day_Meals 
                    WHERE id = ? AND date = ?`;
                db.get(checkNewMealQuery, [day_meals_id, meal.date], (err, existing) => {
                    if (err) {
                        return res.status(500).json({ message: "Error checking new meal availability.", error: err.message });
                    }
                    if (existing.count === 0) {
                        return res.status(400).json({ message: "The selected meal is not available for the current date." });
                    }

                    // Check if the user already booked this meal for the same day
                    const existingBookingQuery = `SELECT COUNT(*) as count FROM Bookings WHERE user_id = ? AND day_meals_id = ?`;
                    db.get(existingBookingQuery, [user_id, day_meals_id], (err, existing) => {
                        if (err) {
                            return res.status(500).json({ message: "Error checking existing booking.", error: err.message });
                        }
                        if (existing.count > 0) {
                            return res.status(400).json({ message: "You have already booked this meal for the selected day." });
                        }

                        // Check if the current date is valid for updating the booking
                        if (!isDateValid(meal.date)) {
                            return res.status(400).json({ message: "Cannot update booking because it must be done at least one day before the meal date." });
                        }

                        // Update the booking if the date is valid
                        const updateSql = `UPDATE Bookings SET user_id = ?, day_meals_id = ?, booking_schedule = ? WHERE id = ?`;
                        db.run(updateSql, [user_id, day_meals_id, booking_schedule, id], function (err) {
                            if (err) {
                                return res.status(500).json({ message: "Error updating booking.", error: err.message });
                            }
                            return res.status(200).json({ message: "Booking updated successfully." });
                        });
                    });
                });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
});


router.delete('/del/:id', authenticateToken, async (req, res) => {
    const id = req.params.id;
    const sql = `
    DELETE 
    FROM Bookings 
    Where id = ?
    `;

    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(500).json({ "Error deleting from DB": err.message });
        }
        return res.status(200).json({ message: "Booking deleted." });
    });

});




// DELETE BOOKING ID
router.delete('/:id', authenticateToken, async (req, res) => {
    const id = req.params.id;

    try {
        // Check if booking exists
        const checkSql = `SELECT * FROM Bookings WHERE id = ?`;
        db.get(checkSql, [id], (err, row) => {
            if (err) {
                return res.status(500).json({ message: "Error checking booking.", error: err.message });
            }
            if (!row) {
                return res.status(404).json({ message: "Booking not found." });
            }

            // Fetch the meal date associated with the day_meals_id from the booking
            const mealDateQuery = `SELECT dm.date FROM Day_Meals dm JOIN Bookings b ON dm.id = b.day_meals_id WHERE b.id = ?`;
            db.get(mealDateQuery, [id], (err, meal) => {
                if (err) {
                    return res.status(500).json({ message: "Error retrieving meal date.", error: err.message });
                }
                if (!meal) {
                    return res.status(404).json({ message: "Meal not found." });
                }

                // Check if the current date is valid for deleting the booking
                if (!isDateValid(meal.date)) {
                    return res.status(400).json({ message: "Cannot delete booking because it must be done at least one day before the meal date." });
                }

                // Check if there are any existing bookings for the same meal date
                const existingBookingsQuery = `SELECT COUNT(*) as count FROM Bookings WHERE day_meals_id = ? AND id != ?`;
                db.get(existingBookingsQuery, [row.day_meals_id, id], (err, existing) => {
                    if (err) {
                        return res.status(500).json({ message: "Error checking existing bookings.", error: err.message });
                    }
                    if (existing.count > 0) {
                        return res.status(400).json({ message: "Cannot delete booking because there are other bookings for this meal." });
                    }

                    // Proceed to delete the booking
                    const deleteSql = `DELETE FROM Bookings WHERE id = ?`;
                    db.run(deleteSql, [id], function (err) {
                        if (err) {
                            return res.status(500).json({ "Error deleting from DB": err.message });
                        }
                        return res.status(200).json({ message: "Booking deleted." });
                    });
                });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
});

//get booking with userid and date
router.get('/booking-id/:date', authenticateToken, (req, res) => {
    const user_id = req.user;
    const date = req.params.date;

    console.log(user_id);
    console.log(date);
    
    const sql = `
        SELECT 
            b.*
        FROM 
            Bookings b
        JOIN 
            Day_Meals dm ON b.day_meals_id = dm.id 
        WHERE
            b.user_id = ? AND dm.date = ?
    `;

    db.get(sql, [user_id,date], (err, rows) => {
        if (err) {
            return res.status(500).json({ "Error retrieving data": err.message });
        }
        if (rows.length === 0) {
            return res.status(202).json({ message: "No bookings found for this user." });
        }
        return res.status(200).json({ bookings: rows });
    });
    
});




//GET meal date BY DATE AND USER ID
router.get('/load', authenticateToken, (req, res) => {
    const user_id = req.user;
    
    const sql = `
        SELECT 
            Day_Meals.date AS meal_date
        FROM 
            Bookings 
        JOIN 
            Day_Meals ON Bookings.day_meals_id = Day_Meals.id 
        WHERE
            Bookings.user_id = ? 
    `;

    db.all(sql, [user_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ "Error retrieving data": err.message });
        }
        if (rows.length === 0) {
            return res.status(202).json({ message: "No bookings found for this user." });
        }
        return res.status(200).json({ bookings: rows });
    });
    
});

//get booking day meal id and schedule
router.get('/verify-booking/:date', authenticateToken, (req, res) => {
    const user_id = req.user;
    const date = req.params.date;
    
    const sql = `
        SELECT 
            Bookings.day_meals_id, Bookings.booking_schedule
        FROM 
            Bookings
        JOIN 
            Day_Meals ON Bookings.day_meals_id = Day_Meals.id 
        WHERE
            Bookings.user_id = ? AND Day_Meals.date = ?
    `;

    db.all(sql, [user_id,date], (err, rows) => {
        if (err) {
            return res.status(500).json({ "Error retrieving data": err.message });
        }
        if (rows.length === 0) {
            return res.status(202).json({ message: "No bookings found for this user." });
        }
        return res.status(200).json({ bookings: rows });
    });
});





module.exports = router;