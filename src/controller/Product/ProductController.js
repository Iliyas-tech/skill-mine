const reqResponse = require('../../cors/responseHandler');
const { v4: uuidv4, validate: uuidValidate } = require('uuid');

module.exports = (modalMap, router) => {
    const Op = modalMap.Sequelize.Op;
    const categoryTbl = modalMap["category"];
    const productTbl = modalMap["product"];

    /**Add Product API */
    const addProduct = async(req, res)=>{
        try{
            /*Product Info**/
            if (Object.keys(req.body).length === 0 && (req.body).constructor === Object) {
                return res.status(400).send(
                  { "status": "400", message: "Bad Request, mandatory body fields are required!", data: [] }
                )
            }
            let productData = req.body;
            let productInfo = {
                id :  uuidv4(),
                name : productData ? productData.name: null,
                category_id : productData ? productData.category_id : null,
                /**Audit column */
                is_voided: false,
                is_enabled: true
            }
            /**Throw Error when Category is null while adding product */
            if(productInfo.category_id == null){
                return res.status(400).send({
                    status : false,
                    message : 'Please Add Product Under Category'
                })
            }
            /**Check duplication of Product */
            let if_exist = await productTbl.findOne({
                where : {
                    name : productInfo.name,
                    category_id : productInfo.category_id
                }
            })
            if(if_exist){
                return res.status(400).send({
                    status : false,
                    message : 'Duplication of Product Not Allowed'
                })
            }
            else{
                /**Inserting into db */
                let result = productTbl.create(productInfo)
                return res.status(200).send(reqResponse.sucessResponse(200, "Product Added Successfully"))
            }
        }
        catch(error){
            return res.status(400).send(reqResponse.errorResponse(400, error))
        }
    }

    /**Update Product */
    const updateProduct = async(req, res)=>{
        let {id} = req.params
        let data = req.body
        let name = data ? data.name : null
        let category_id = data ? data.category_id : null

        if (!name || !category_id) {
            return res.status(400).send({
                status: false,
                error: "Mandatory Fields are required"
            });
        }
        try{
            let is_exist = await productTbl.findOne({
                where : {
                    id,
                    is_voided : false
                }
            })
            if(is_exist != null){
                let result = await productTbl.update({
                   name
                }, { where: {id}}
                )
                return res.status(200).send(reqResponse.sucessResponse(200, "Product Updated Successfully"))
            }
            /**When Product Not Found */
            else{
                return res.status(400).send({
                    status : false,
                    message : 'Sorry, No Product Found!'
                })
            }
        }
        catch(error){
            return res.status(400).send(reqResponse.errorResponse(400, error))
        }
    }

    /**Delete Product */
    const deleteProduct = async(req, res)=>{
        let {id} = req.params
        try{
            let is_exist = await productTbl.findOne({
                where : {
                    id,
                    is_voided : false
                }
            })
            if(is_exist != null){
                let result = await productTbl.update({
                    is_voided: true
                }, { where: {id}}
                )
                return res.status(200).send(reqResponse.sucessResponse(200, "Product Deleted Successfully"))
            }
            /**When Product Not Found */
            else{
                return res.status(400).send({
                    status : false,
                    message : 'Sorry, No Product Found!'
                })
            }
        }
        catch(error){
            return res.status(400).send(reqResponse.errorResponse(400, error))
        }
    }

    /**Get Products with pagination and offset*/
    const getProduct = async(req, res)=>{
        const { page, pageSize } = req.query
        try{
            /*For Pagination**/
            let limit = pageSize ? pageSize : 10
            let pageNumber = page
            let offset = pageNumber ? (pageNumber - 1) * limit : 0

            let findData = {}
            let condition = {}
            condition.is_voided = false;

            /**Filter By Product Search*/
            if(req.query.name){
                condition = {
                    name :{
                        [Op.iLike] : '%' + req.query.name + '%'
                    }
                }
            }
            /**Filter By Category */
            if(req.query.category_id){
                condition.category_id = req.query.category_id
            }
            findData.where = condition
            findData.attributes = ['id', 'name', 'category_id']
            
            let totalCount = 0
            if (req.query.page || req.query.pageSize) {
                findData.limit = limit
                findData.offset = offset
            }
            /**Retrieve Product with the Above Conditions */
            let getProducts = await productTbl.findAll(findData)
            let data = {
                totalCount: getProducts ? getProducts.length : totalCount,
                data: getProducts
            }
            return res.status(200).send(reqResponse.sucessResponse(200, 'Products List', data));
        }
        catch(error){
            return res.status(400).send(reqResponse.errorResponse(400, error))
        }
    }

    return {
        addProduct, updateProduct, deleteProduct, getProduct
    }
}