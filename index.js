const express = require("express");
const app = express();
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const port = process.env.PORT || 6066;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello from other side..");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t1m6g.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


client.connect((err) => {
  console.log("connection err", err);
  const productCollection = client.db(`${process.env.DB_NAME}`).collection("product");
  const productCollectionForOrder = client.db(`${process.env.DB_NAME}`).collection("order");

  app.get("/products", (req, res) => {
    productCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.post("/addProduct", (req, res) => {
    const newProduct = req.body;
    productCollection.insertOne(newProduct).then((result) => {
      // console.log("inserted count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/checkout/:_id", (req, res) => {
    productCollection
      .find({ _id: ObjectId(req.params._id) })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.post("/addOrders", (req, res) => {
    const newOrder = req.body;
    productCollectionForOrder.insertOne(newOrder).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/orders", (req, res) => {
    productCollectionForOrder
      .find({ email: req.query.email })
      .toArray((err, items) => {
        res.send(items);
      });
  });

  app.delete("/delete/:id", (req, res) => {
    productCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });
});

app.listen(process.env.PORT || port);
