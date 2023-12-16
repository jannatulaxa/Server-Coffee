const express = require("express");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());

// MongoDB COde:

const uri = `mongodb+srv://${process.env.DB_U_NAME}:${process.env.DB_PASS}@cluster0.rsgizg7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
   

    // Database For All Product Adding By Admin
    const AddProductCollection = client
      .db("AddCoffeeDB")
      .collection("Products");
    // Database For Add Product in the cart
    const AddCartProductCollection = client.db("CartCoffeeDB").collection("CartData");

    // --------------------------------AddProductCollection Data Collection Server--------------------------------------

      //<------------------Payments Info Database----------------->

      app.post("/create-payment-intent", async (req, res) => {
        const { price } = req.body;
        const amount = parseInt(price * 100);
   
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });
    
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      });

    // Insert General Data Into Database:
    app.post("/addProduct", async (req, res) => {
      const addingProducts = req.body;
      const result = await AddProductCollection.insertOne(addingProducts);
      res.send(result);
    });
    // Read All General Product From Database:
    app.get("/addProduct", async (req, res) => {
      const cursor = AddProductCollection.find();
      const result = await cursor.toArray();

      res.send(result);
    });
    // Read All General Product From Database:
    app.get("/addProducts", async (req, res) => {
      const cursor = AddProductCollection.find();
      const result = await cursor.toArray();

      res.send(result);
    });
    // Read All General Product From Database:
    app.get("/addProducts/:brand_name", async (req, res) => {
      const products = req.params;
      const query = { brand_name: products.brand_name };
      const cursor = AddProductCollection.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });
    // POST and Read From Database:
    app.post("/addProducts", async (req, res) => {
      try {
        const products = req.body; // This contains the brand_name sent from the frontend

        // Use the brand_name to query your MongoDB collection
        const query = { brand_name: products.brand_name };
        const cursor = AddProductCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      
      } catch (error) {
        console.error("Error querying the database:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Read With Id From All Cart Product From Database:
    app.get("/addProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await AddProductCollection.findOne(query);
      res.send(result);
    });

    // Update Data in Database
    app.patch("/addProduct/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };

      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: data.name,
          brand_name:data.brand_name,
          type:data.type,
          price:data.price,
          description:data.description,
          rating:data.rating,
          photo:data.photo,
        },
      };
      const result = await AddProductCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });



    // Card Data Product Section

    // Insert Cart Data Into Database:
    app.post("/cartProduct", async (req, res) => {
      const addingCartProducts = req.body;
      const result = await AddCartProductCollection.insertOne(
        addingCartProducts
      );
      res.send(result);
    });

    // Read All Cart Product From Database:
    app.get("/cartProduct", async (req, res) => {
      const cursor = AddCartProductCollection.find();
      const result = await cursor.toArray();

      res.send(result);
    });

    // Delete Data From Database
    app.delete("/cartProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await AddCartProductCollection.deleteOne(query);
      res.send(result);
    });
   
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
   
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello I am REST API");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});