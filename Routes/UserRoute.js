const express = require("express");
const userController = require("../Controllers/UserController");

const UserRouter = express.Router();

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

UserRouter.get("/profile", authenticate, userController.getProfile);
UserRouter.post("/insertData", userController.addUser);
UserRouter.put("/updateData/:id", userController.editUser);
UserRouter.put("/updateAllData", userController.editAllUser);
UserRouter.delete("/deleteData/:id", userController.deleteUser);
UserRouter.post("/cart", userController.addCartUser);
UserRouter.get("/cart/:userId", userController.fetchCartUser);

module.exports = UserRouter;
