const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
require('dotenv').config(); // .env
require('dotenv').config({ path: './.config' }); //.config

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to SQLite Database
const db = new sqlite3.Database("database.db", (err) => {
  if (err) {
    console.error(process.env.ERROR_DB_CONNECT, err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Routes

// Route Users
const userRouter = require("./routes/user");
app.use("/api/user", userRouter);
// Route Marcações
const marcacoesRouter = require("./routes/marcacoes");
app.use("/api/marcacoes", marcacoesRouter);
//Route refeições
const refeicoesRouter = require("./routes/refeicoes");
app.use("/api/refeicoes", refeicoesRouter);
//Route Day Meals
const refeicoesDia = require("./routes/refeicoesDia");
app.use("/api/refeicoes-dia", refeicoesDia);
// Route Validations
const validations = require("./routes/validations");
app.use("/api/validations", validations);
//Route exports
const fileExports = require("./routes/exports");
app.use("/api/exports", fileExports);

// Sample route to check CORS
app.get("/test-cors", (req, res) => {
  res.json({ message: "CORS is working!" });
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});