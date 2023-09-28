const { db } = require("../database/db-connection");
const { UserDao, User } = require("../models/users-model");

class UsersController {
  constructor() {
    this.usersDao = new UserDao();
  }

  async getUsers(req, res) {
    console.info("GET USERS");
    const { page } = req.query;
    const amount = await this.usersDao.getAmountUsers();

    let users = await this.usersDao.getUsersWithPagination(parseInt(page) || 1);
    res.render("home", { users, amount });
  }

  async createUser(req, res) {
    console.info("Create user");

    const { name, email, phone, role, cpf } = req.body;
    if (!name || !email || !phone || !role || !cpf) {
      res.status(400).send("Bad request - missing parameters");
      return;
    }

    await this.usersDao.addUser({ role, name, email, phone, cpf });

    return res.redirect("/home");
  }

  async editUser(req, res) {
    console.info("Edit user");
    let id = req.params.id;
    const { email, phone } = req.body;
    if (!email || !phone) {
      res.status(400).send("Bad request - missing parameters");
      return;
    }

    await this.usersDao.editUser({ userId: id, email, phone });
    return res.redirect("/home");
  }

  async detailsUser(req, res) {
    console.info("Details user");
    let id = req.params.id;
    const { leading_phone, leading_email } = req.query;

    let user = await this.usersDao.getDetailsUsers(id);

    res.render("edit-user", { user, leading_phone, leading_email });
  }

  async deleteUser(req, res) {
    console.info("Delete user");
    let id = req.params.id;

    await this.usersDao.deleteUser(id);
    return res.redirect("/home");
  }

  async exportToCSV(req, res) {
    await this.usersDao.exportUser();
    return res.redirect("/home");
  }
}

module.exports = {
  UsersController,
};
