const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
// Middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Chocolate Management Server is Running.");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.poiwoh3.mongodb.net/?retryWrites=true&w=majority`;

// Creating MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("chocolateDB");
    const chocolateCollection = database.collection("chocolates");

    // Create
    app.post("/addChocolate", async (req, res) => {
      const chocolate = req.body;

      const result = await chocolateCollection.insertOne(chocolate);
      res.send(result);
    });

    // Read
    app.get("/chocolates", async (req, res) => {
      const cursor = chocolateCollection.find();

      const result = await cursor.toArray();
      res.send(result);
    });

    // Read Single Item
    app.get("/chocolates/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await chocolateCollection.findOne(query);
      res.send(result);
    });

    // Update
    app.put("/chocolates/:id", async (req, res) => {
      const id = req.params.id;
      const chocolate = req.body;

      const filter = { _id: new ObjectId(id) };

      const options = { upsert: true };

      const { _id, name, country, photo, price, category } = chocolate;

      const updatedChocolate = {
        $set: {
          name: name,
          country: country,
          photo: photo,
          price: price,
          category: category,
        },
      };

      const result = await chocolateCollection.updateOne(
        filter,
        updatedChocolate,
        options
      );

      res.send(result);
    });

    // Delete
    app.delete("/chocolates/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await chocolateCollection.deleteOne(query);

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Chocolate Management Server is Running on port: ${port}`);
});
