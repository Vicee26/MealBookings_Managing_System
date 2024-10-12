const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const PDFDocument = require('pdfkit');

const router = express.Router();
const db = new sqlite3.Database('./database.db'); // Ensure the path to your database is correct

// Function to create and send a PDF document
const generatePDF = (res, title, rows, formatRow) => {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');

    // Generate current date and time for the filename
    const now = new Date();
    const dateString = now.toISOString().replace(/T/, '-').replace(/:/g, '-').split('.')[0]; // Format: YYYY-MM-DD-HH-MM-SS
    const filename = `${title.replace(/\s+/g, '_')}_${dateString}.pdf`; // Replace spaces with underscores

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    doc.pipe(res);
    
    doc.fontSize(25).text(`${title} Report`, { align: 'center' });
    doc.moveDown();
    
    rows.forEach((row, index) => {
        formatRow(doc, row, index);  // Pass 'doc' to formatRow here
        doc.moveDown(); // Add extra space between entries
    });
    
    doc.end();
};

// Export Users List
router.get('/users-pdf', (req, res) => {
    db.all("SELECT * FROM Users", [], (err, rows) => {
        if (err) {
            return res.status(500).send("Error retrieving users");
        }

        // Define the formatRow function here
        const formatRow = (doc, user, index) => {
            const tableTop = 150 + index * 30; // Calculate position for each row

            // Column headers (only rendered once, at the start)
            if (index === 0) {
                doc.fontSize(14).text('User ID', 50, 130);
                doc.text('Name', 150, 130);
                doc.text('Email', 300, 130);
                doc.moveDown();
            }

            // Render row data
            doc.fontSize(12).text(user.id, 50, tableTop);  // User ID column at X=50
            doc.text(user.name, 150, tableTop);             // Name column at X=150
            doc.text(user.email, 300, tableTop);            // Email column at X=300
        };

        // Call generatePDF here, passing rows and formatRow
        generatePDF(res, 'Users', rows, formatRow);
    });
});



// Export Bookings List
router.get('/bookings-pdf', (req, res) => {
    db.all("SELECT * FROM Bookings", [], (err, rows) => {
        if (err) {
            return res.status(500).send("Error retrieving bookings");
        }
        
        const formatRow = (doc, booking) => {
            doc.fontSize(12).text(`Booking ID: ${booking.id}`);
            doc.text(`User ID: ${booking.user_id}`);
            doc.text(`Day Meal ID: ${booking.day_meals_id}`);
            doc.text(`Booking Schedule: ${booking.booking_schedule}`);
            doc.moveDown();
        };

        generatePDF(res, 'Bookings', rows, formatRow);
    });
});

// Export Meals List
router.get('/meals-pdf', (req, res) => {
    db.all("SELECT * FROM Meals", [], (err, rows) => {
        if (err) {
            return res.status(500).send("Error retrieving meals");
        }
        
        const formatRow = (doc, meal) => {
            doc.fontSize(12).text(`Meal ID: ${meal.id}`);
            doc.text(`Name: ${meal.name}`);
            doc.text(`Description: ${meal.description}`);
            doc.text(`Status: ${meal.status}`);
            doc.moveDown();
        };

        generatePDF(res, 'Meals', rows, formatRow);
    });
});

// Export Day Meals List
router.get('/day-meals-pdf', (req, res) => {
    db.all("SELECT * FROM Day_Meals", [], (err, rows) => {
        if (err) {
            return res.status(500).send("Error retrieving day meals");
        }
        
        const formatRow = (doc, dayMeal) => {
            doc.fontSize(12).text(`Day Meal ID: ${dayMeal.id}`);
            doc.text(`Type: ${dayMeal.type}`);
            doc.text(`Meal ID: ${dayMeal.meal_id}`);
            doc.text(`Date: ${dayMeal.date}`);
            doc.moveDown();
        };

        generatePDF(res, 'Day Meals', rows, formatRow);
    });
});

module.exports = router;
