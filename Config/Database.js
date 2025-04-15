const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    // await mongoose.connect("mongodb+srv://vishalagajera:r7WDhUhDDLqaoFP1@cluster0.rqw5i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    await mongoose.connect("mongodb+srv://vishalagajera:r7WDhUhDDLqaoFP1@cluster0.rqw5i.mongodb.net/ECommerce?retryWrites=true&w=majority");
    // await mongoose.connect("mongodb://localhost:27017/e-commerce");
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDatabase;



// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://vishalagajera:<db_password>@cluster0.rqw5i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
