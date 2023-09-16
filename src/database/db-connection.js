const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('db.sqlite', (err) => {
    if (err) {
        console.log('Error connecting to database', err);
        return;
    }
    console.log('Database connected!');
});

module.exports = {
    db
}