const { Router} = require('express');
const router = Router();

const { UsersController } = require('../controllers/users-controller');

const userController = new UsersController();

router.get('/', (req, res) => userController.getUsers(req, res));

router.get('/add-user', (req, res) => res.render('add-user'));
router.post('/add-user', (req, res) => userController.createUser(req, res));

router.get('/update-user', (req, res) => res.render('edit-user'));
router.post('/update-user', (req, res) => userController.createUser(req, res));

module.exports = {
    usersRouter: router
};