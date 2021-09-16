const router = require('express').Router();
const {modelMap } = require("../../models");
const RouteConstant = require('../../constant/Routes');
const ProductController = require('./ProductController')(modelMap);


module.exports = (app) => {
    router.post("/", ProductController.addProduct);
    router.get("/retrieve", ProductController.getProduct);
    router.put("/update/:id", ProductController.updateProduct);
    router.delete("/remove/:id", ProductController.deleteProduct);


    app.use(`${RouteConstant.VERSION+RouteConstant.PRODUCT}`, router);
};

