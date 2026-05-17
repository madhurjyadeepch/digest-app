require("dotenv").config();
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log(err.name, ":", err.message);
  process.exit(1);
});

const app = require("./app");

const DB = process.env.DATABASE_PASSWORD
  ? process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)
  : process.env.DATABASE;

// dotenv.config({ path: './config.env' });
mongoose.connect(DB).then((con) => {
  // console.log(con.connections);
  console.log("DB connection is successful!");
});

const PORT = process.env.PORT; //|| 8000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`App running on port ${PORT}...`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, ":", err.message);
  server.close(() => {
    process.exit(1);
  });
});
