const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("db.sqlite", (err) => {
  if (err) {
    console.error("Error connecting to database", err);
    return;
  }
  console.error("Database connected!");
});

module.exports = {
  db,
};
