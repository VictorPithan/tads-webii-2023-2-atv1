const path = require("path");
const express = require("express"); 
const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const { usersRouter } = require('./routes/users-routes');
app.use(usersRouter);

app.use('*', (req, res) => {
    res.redirect('/home');
});

app.listen(3000, () => {
    console.info("Server is running on port 3000");
});