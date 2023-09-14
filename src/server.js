const path = require("path");
const express = require("express"); 
const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));

// FORM DATA
app.use(express.urlencoded({ extended: false }));
// API JSON
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/teste', (req, res) => {
    res.send('Funciona');
});

app.get('/', (req, res) => {
  res.render('home')
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});