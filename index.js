const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = "mongodb://localhost:27017";

// Create a new MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and collection
const databaseName = "Photographyservice";
const collectionName = "service";

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    app.get('/services', async (req, res) => {
      try {
        const cursor = collection.find();
        const result = await cursor.toArray();
        res.status(200).json(result);
      } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ error: 'Failed to retrieve services' });
      }
    });

    app.get('/services/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const service = await collection.findOne(query);
    
        if (service) {
          res.status(200).json(service);
        } else {
          res.status(404).json({ error: 'Service not found' });
        }
      } catch (error) {
        console.error("Error fetching service by ID:", error);
        res.status(500).json({ error: 'Failed to retrieve the service' });
      }
    });

    app.post('/services/:id/review', async (req, res) => {
      const serviceId = req.params.id;
      const { comment, author } = req.body;
    
      try {
        const service = await collection.findOne({ _id: new ObjectId(serviceId) });
        if (service) {
          await collection.updateOne(
            { _id: new ObjectId(serviceId) },
            { $push: { reviews: { comment, author, date: new Date() } } }
          );
          res.status(200).send({ message: 'Review added successfully!' });
        } else {
          res.status(404).send({ message: 'Service not found!' });
        }
      } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).send({ message: 'Error adding review', error });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. Successfully connected to MongoDB!");

  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

// Run the database connection and server start
run().catch(console.dir);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
