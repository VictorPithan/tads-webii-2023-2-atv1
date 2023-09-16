const { toCSV } = require('../../utils/exportCSV');
const { db } = require('../database/db-connection');
const { UserDao } = require("../models/users-model");

class UsersController {

    constructor() {
        this.usersDao = new UserDao();
    }

    async getUsers(req, res) {
        console.log("GET USERS");
        
        let users = await this.usersDao.getUsers();
        
        // remover professor (exemplo adicionando regra de negocio)
        // users = users.filter(user => !user.professor);
        console.log("Users => ", users)
        console.log("Users to CSV => ", toCSV(users))
        
        res.render('home', { users });
    }

    createUser(req, res) {
        console.log('Create user');
        const { name, email, phone } = req.body;
        if (!name || !email || !phone) {
            // TODO TAREFA - PAGINA DE CRIACAO INDICANDO OS ERROS NO FORMULARIO
            res.status(400).send('Bad request - missing parameters');
            return;
        }

        const user = {
            name,
            email,
            phone
        };

        // this.usersDao.addUser(user);
        // res.redirect('/users');
        res.send('OK - create user\n' + JSON.stringify(req.body));
    }

    editUser(req, res) {
        console.log('Edit user');
        const { name, email, phone } = req.body;
        if (!name || !email || !phone) {
            // TODO TAREFA - PAGINA DE CRIACAO INDICANDO OS ERROS NO FORMULARIO
            res.status(400).send('Bad request - missing parameters');
            return;
        }

        const user = {
            name,
            email,
            phone
        };

        // this.usersDao.addUser(user);
        // res.redirect('/users');
        res.send('OK - edit user\n' + JSON.stringify(req.body));
    }

}

module.exports = {
    UsersController
}