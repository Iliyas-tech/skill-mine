const router = require('express').Router();
const {modelMap } = require("../../models");
const RouteConstant = require('../../constant/Routes');
const CategoryController = require('./CategoryController')(modelMap);


module.exports = (app) => {
    router.post("/", CategoryController.addCategory);
    router.get("/retrieve", CategoryController.getCategory);
    router.put("/update/:id", CategoryController.updateCategory);
    router.delete("/remove/:id", CategoryController.deleteCategory);


    app.use(`${RouteConstant.VERSION+RouteConstant.CATEGORY}`, router);
};

