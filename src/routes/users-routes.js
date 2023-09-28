const { Router } = require("express");
const router = Router();

const { UsersController } = require("../controllers/users-controller");

const userController = new UsersController();

router.get("/home", (req, res) => userController.getUsers(req, res));

router.get("/add-user", (req, res) => res.render("add-user"));
router.post("/add-user", (req, res) => userController.createUser(req, res));

router.get("/update-user/:id", (req, res) =>
  userController.detailsUser(req, res)
);
router.post("/update-user/:id", (req, res) =>
  userController.editUser(req, res)
);

router.get("/delete-user/:id", (req, res) =>
  userController.deleteUser(req, res)
);

router.get("/export-users", (req, res) => userController.exportToCSV(req, res));

module.exports = {
  usersRouter: router,
};
