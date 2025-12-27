const express = require("express");
const router = express.Router();

const CalendarEvent = require("../models/CalendarEvent");

// ───────────────────────────────
// GET ALL EVENTS
// ───────────────────────────────
router.get("/", async (req, res) => {
    try {
        const events = await CalendarEvent.find()
            .populate("equipment")
            .populate("team")
            .populate("technician");

        res.json(events);
    } catch (err) {
        res.status(500).json({ message: "Error fetching events" });
    }
});

// ───────────────────────────────
// CREATE EVENT
// ───────────────────────────────
router.post("/", async (req, res) => {
    try {
        const event = new CalendarEvent(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ message: "Error creating event" });
    }
});

// ───────────────────────────────
// UPDATE EVENT
// ───────────────────────────────
router.put("/:id", async (req, res) => {
    try {
        const updated = await CalendarEvent.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updated);
    } catch {
        res.status(400).json({ message: "Error updating event" });
    }
});

// ───────────────────────────────
// DELETE EVENT
// ───────────────────────────────
router.delete("/:id", async (req, res) => {
    try {
        await CalendarEvent.findByIdAndDelete(req.params.id);
        res.json({ message: "Event deleted" });
    } catch {
        res.status(400).json({ message: "Error deleting event" });
    }
});

module.exports = router;
