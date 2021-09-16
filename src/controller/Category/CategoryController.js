const reqResponse = require('../../cors/responseHandler');
const { v4: uuidv4, validate: uuidValidate } = require('uuid');

module.exports = (modalMap, router) => {
    const Op = modalMap.Sequelize.Op;
    const categoryTbl = modalMap["category"];
    const productTbl = modalMap["product"];

    /**Add Category and Sub Category API */
    const addCategory = async(req, res)=>{
        try{
            /*Category Info**/
            if (Object.keys(req.body).length === 0 && (req.body).constructor === Object) {
                return res.status(400).send(
                  { "status": "400", message: "Bad Request, mandatory body fields are required!", data: [] }
                )
            }
            const catUUID = uuidv4();
            let categoryData = req.body;
            let categoryInfo = {
                id :  catUUID,
                name : categoryData ? categoryData.name: null,
                parent_id : categoryData ? categoryData.parent_id : null,
                /**Audit column */
                is_voided: false,
                is_enabled: true
            }
            /**Check duplication of Category */
            let if_exist = await categoryTbl.findOne({
                where : {
                    name : categoryInfo.name,
                    parent_id : null
                }
            })
            if(if_exist){
                return res.status(400).send({
                    status : false,
                    message : 'Duplication of Category and SubCategory Not Allowed'
                })
            }
            else{
                /**Inserting into db */
                let result = categoryTbl.create(categoryInfo)
                res.status(200).send(reqResponse.sucessResponse(200, "Category Added Successfully"))
            }
        }
        catch(error){
            console.log('error');
            return res.status(400).send(reqResponse.errorResponse(400, error))
        }
    }

    /**Get All Category and its Sub Categories */
    const getCategory = async(req, res)=>{
        try{
            let result = await categoryTbl.findAll({
                where : {
                    parent_id : null,
                    is_voided : false
                },
                attributes: ['id', 'name', 'parent_id'],
                include: [{
                    model : categoryTbl,
                    as : 'subcategories',
                    required : false,
                    attributes : ['id', 'name'],
                    include : [
                        {
                            model : productTbl,
                            as : 'product_info',
                            attributes:['id', 'name'],
                            is_voided : false
                        }
                    ]
                }]
            })
            return res.status(200).send(reqResponse.sucessResponse(200, "Category and Sub Categories Retreived Successfully", result))
        }
        catch(error){
            return res.status(400).send(reqResponse.errorResponse(400, error))
        }
    }

    /**Update Category */
    const updateCategory = async(req, res)=>{
        const {id} = req.params
        let data = req.body
        let name = data ? data.name : null
        let parent_id = data ? data.parent_id : null
        
        try{
            let result = await categoryTbl.findOne({
                where: {
                    id,
                    is_voided : false
                }
            })
            if(result == null){
                return res.status(400).send({
                    status : false,
                    message : 'Sorry, No Category Found!'
                })
            }
            /**Update the SubCategory if no Parent */
            if(result.parent_id != null){
                let subCatUpdate = await categoryTbl.update({
                    name,
                    parent_id
                },{
                    where: {
                        id, 
                        is_voided: false
                    }
                })
                return res.status(200).send(reqResponse.sucessResponse(200, "Category Updated Succesfully"))
            }
            else{
                /**Update the Category */
                let catUpdate = await categoryTbl.update({
                    name,
                    parent_id
                },{
                    where: {
                        id, 
                        is_voided: false
                    }
                })
                return res.status(200).send(reqResponse.sucessResponse(200, "Category Updated Succesfully"))
            }
        }
        catch(error){
            return res.status(400).send(reqResponse.errorResponse(400, error))
        }
    }
    /**Delete Category Leads to Product Deletion also*/
    const deleteCategory = async(req, res)=>{
        const {id} = req.params
        try{
            let result = await categoryTbl.findOne({
                where : {
                    id ,
                    is_voided : false
                }
            })
            /**When No Category Found */
            if(result == null){
                return res.status(400).send({
                    status : false,
                    message : 'Sorry, No Category Found!'
                })
            }
            /**Soft Delete Sub-Category and its Product If Category is null */
            if(result.parent_id != null){
                console.log('SubCategories and Products');
                let subCatDeletion = await categoryTbl.update({
                    is_voided: true
                },{
                    where: {
                        id, 
                        is_voided: false
                    }
                })
                let productDeletion = await productTbl.update({
                    is_voided: true
                },{
                    where: {
                        category_id : result.id,
                        is_voided: false
                    }
                })
                return res.status(200).send(reqResponse.sucessResponse(200, "Category Deleted Succesfully"))
            }
            /**Else Soft Delete Category, subCategory and products inside of it */
            else{
                /**Soft Delete Categories */
                let catDeletion = await categoryTbl.update({
                    is_voided: true
                },{
                    where: {
                        id, 
                        is_voided: false
                    }
                })
                /**Collects ids of Sub Categories */
                let subCats = await categoryTbl.findAll({
                    where: {
                        parent_id : id,
                        is_voided: false
                    }
                })
                /**Soft Delete SubCategories */
                let subCatDeletion = await categoryTbl.update({
                    is_voided: true
                },{
                    where: {
                        parent_id : id,
                        is_voided: false
                    }
                })
                const subCatIds = []
                subCats.forEach(x =>{
                    subCatIds.push(x.id);
                })
                /**Soft Delete Product Under SubCategories */
                let productDeletion = await productTbl.update({
                    is_voided: true
                },{
                    where: {
                        category_id : subCatIds,
                        is_voided: false
                    }
                })
                res.status(200).send(reqResponse.sucessResponse(200, "Category Deleted Succesfully"))
            }
        }
        catch(error){
            return res.status(400).send(reqResponse.errorResponse(400, error))
        }
    }
    
    return {
        addCategory, getCategory, updateCategory, deleteCategory
    }
}