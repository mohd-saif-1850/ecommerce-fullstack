import { Item } from "../models/item.model.js"
import cloudinaryUpload from "../utils/cloudinary.js"

const createItem = async (req, res) => {
    const {name, price, quantity, description, invoiceNumber} = req.body
    const file = req.file?.path

    if (!name) {
        return res.status(404).json({error : "Name of an Item is Required !"})
    }
    if (!price) {
        return res.status(404).json({error : "Price of an Item is Required !"})
    }
    if (!file) {
        return res.status(404).json({error : "Image of an Item is Required !"})
    }
    if (invoiceNumber) {
        return res.status(404).json({error : "Invoice Number of an Item is Required !"})
    }

    const uploadImage = await cloudinaryUpload(file)

    if (!uploadImage) {
        return res.status(500).json({ error: "Failed to Upload Image on Server !" });
    }

    const item = await Item.create({
        name,
        price,
        quantity,
        description,
        invoiceNumber,
        imageUrl : uploadImage.secure_url
    })

    if (!item) {
        return res.status(500).json({error : "Server Error Occured during Create Item !"})
    }

    return res.status(200).json({
        success : true,
        item,
        message : "Item Created Successfully !"
    })
}

export { createItem }