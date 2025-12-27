const mongoose = require("mongoose");

const CalendarEventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        start: {
            type: Date,
            required: true,
        },

        end: {
            type: Date,
        },

        priority: {
            type: String,
            enum: ["Critical", "High", "Medium", "Low"],
            default: "Low",
        },

        stage: {
            type: String,
            enum: ["Planned", "In Progress", "Done", "Cancelled"],
            default: "Planned",
        },

        equipment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Equipment",
            default: null,
        },

        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MaintenanceTeam",
            default: null,
        },

        technician: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CalendarEvent", CalendarEventSchema);
