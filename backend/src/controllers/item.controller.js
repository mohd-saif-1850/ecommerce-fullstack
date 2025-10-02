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

const getAllItems = async (req,res) => {
    const items = await Item.find()

    if (!items || items.length == 0 ) {
        return res.status(402).json({error : "No Items Found !"})
    }

    return res.status(202).json({
        success : true,
        items,
        message : "Items Fetched Successfully !"
    })
}

const searchItems = async (req, res) => {
  const { query } = req.query;

  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const items = await Item.find({ 
      name: { $regex: query, $options: "i" } 
    }).limit(5);

    if (!items || items.length === 0) {
      return res.status(404).json({ items: [], message: "No Matching Items Found !" });
    }

    res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export { createItem, getAllItems, searchItems, getItemById };