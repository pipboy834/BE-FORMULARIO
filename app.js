const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

// Configurar la conexión a la base de datos
mongoose.connect('mongodb://localhost/mi_proyecto', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const User = mongoose.model('User', UserSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Configurar sesión
app.use(session({
    secret: 'mi_secreto',
    resave: false,
    saveUninitialized: true,
}));

// Rutas
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            res.redirect('/login');
        } else {
            req.session.user = user;
            res.redirect('/dashboard');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
