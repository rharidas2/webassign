// Import required modules
require('dotenv').config();  // Ensure .env variables are loaded

// Debugging line to check if MONGODB_CONN_STRING is loaded correctly
console.log("MongoDB connection string:", process.env.MONGODB_CONN_STRING);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const ListingsDB = require('./modules/listingsDB.js');

// Initialize Express app
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const db = new ListingsDB();

// Middleware
app.use(cors());
app.use(express.json());

// Default GET route to check server status
app.get('/', (req, res) => {
  res.json({ message: "API Listening" });
});

// Add routes for the API
app.post('/api/listings', async (req, res) => {
  try {
    const result = await db.addNewListing(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/listings', async (req, res) => {
  const { page, perPage, name } = req.query;
  try {
    const result = await db.getAllListings(page, perPage, name);  // Updated here
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/listings/:id', async (req, res) => {
  try {
    const result = await db.getListingById(req.params.id);
    if (result) res.json(result);
    else res.status(404).json({ message: "Listing not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/listings/:id', async (req, res) => {
  try {
    const result = await db.updateListingById(req.body, req.params.id);
    if (result.nModified > 0) {  // Check if a listing was actually modified
      res.json({ message: "Listing updated" });
    } else {
      res.status(404).json({ message: "Listing not found or no changes made" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete('/api/listings/:id', async (req, res) => {
  try {
    const result = await db.deleteListingById(req.params.id);
    if (result.deletedCount > 0) {  // Check if a listing was actually deleted
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Listing not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Initialize the database and start the server
db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    console.log("MongoDB connected!");
    app.listen(HTTP_PORT, () => {
      console.log(`Server listening on: ${HTTP_PORT}`);
    });
  })
  .catch(err => {
    console.error(`Unable to start the server: ${err.message}`);
  });
