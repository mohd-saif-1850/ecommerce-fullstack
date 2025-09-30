import mongoose from "mongoose"

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(`${process.env.MONGO_URI}/ecommerce`)
        console.log("DB Connected Successfully !");
        
    } catch (error) {
        console.log("Error While Connecting DB -- ",error);
        process.exit(1)
    }
}

export default connectDb;