
import express from "express";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express();
const port = process.env.PORT || 5000;

// Middleware


app.use(cors());
app.use(express.json());


// MongoDB Connection


if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing from .env file");
}

const client = new MongoClient(process.env.MONGO_URI);

await client.connect();

console.log("Successfully connected to MongoDB!");

const db = client.db("Social-Bridge");
const eventCollection = db.collection("events");


// Better Auth JWT Verification


const AUTH_BASE_URL =
  // process.env.BETTER_AUTH_URL || "http://localhost:3000";
  process.env.BETTER_AUTH_URL;

const JWKS = createRemoteJWKSet(
  new URL(`${AUTH_BASE_URL}/api/auth/jwks`)
);

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized access. Token missing.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Token is empty.",
      });
    }

    // Verify JWT using Better Auth JWKS
    const { payload } = await jwtVerify(token, JWKS);

    // Store verified JWT payload
    req.user = payload;

    console.log("JWT Verified Successfully!");

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);

    return res.status(401).send({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};


// Test API


app.get("/", (req, res) => {
  res.send({
    success: true,
    message: "Social Bridge Server is running!",
  });
});


// Create Event API


app.post("/create-event", verifyToken, async (req, res) => {
  try {
    const eventData = req.body;

    if (!eventData.title || !eventData.date) {
      return res.status(400).send({
        success: false,
        message: "Event title and date are required.",
      });
    }

    const result = await eventCollection.insertOne(eventData);

    res.status(201).send({
      success: true,
      message: "Event created successfully.",
      result,
    });
  } catch (error) {
    console.error("Create Event Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to create event.",
    });
  }
});

// ===============================
// Get All Events API
// ===============================


// ===============================
// Get All Events API (Public)
// ===============================

app.get("/create-event", async (req, res) => {
  try {
    const result = await eventCollection.find().toArray();

    res.status(200).send(result);
  } catch (error) {
    console.error("Get Events Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch events.",
    });
  }
});


// ===============================
// Get Single Event API
// ===============================

app.get("/upcoming-event/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const result = await eventCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      return res.status(404).send({
        success: false,
        message: "Event not found.",
      });
    }

    res.status(200).send(result);
  } catch (error) {
    console.error("Get Single Event Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch event.",
    });
  }
});

// ===============================
// Update Event API
// ===============================

app.put("/events/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, ...updates } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID.",
      });
    }

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Organizer email is required.",
      });
    }

    const existing = await eventCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existing) {
      return res.status(404).send({
        success: false,
        message: "Event not found.",
      });
    }

    // Ownership check
    if (existing.email !== email) {
      return res.status(403).send({
        success: false,
        message: "You can only update events you created.",
      });
    }

    // Prevent overwriting protected fields
    delete updates._id;
    delete updates.email;

    await eventCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    res.status(200).send({
      success: true,
      message: "Event updated successfully.",
    });
  } catch (error) {
    console.error("Update Event Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to update event.",
    });
  }
});

// ===============================
// Delete Event API
// ===============================

app.delete("/events/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID.",
      });
    }

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Organizer email is required.",
      });
    }

    const existing = await eventCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existing) {
      return res.status(404).send({
        success: false,
        message: "Event not found.",
      });
    }

    // Ownership check
    if (existing.email !== email) {
      return res.status(403).send({
        success: false,
        message: "You can only delete events you created.",
      });
    }

    await eventCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.status(200).send({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Event Error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to delete event.",
    });
  }
});

// ===============================
// Start Server
// ===============================

app.listen(port, () => {
  console.log(`Social Bridge Server running on port ${port}`);
});
