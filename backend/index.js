const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const calendarEventsRoute = require("./routes/calendarEvents");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/maintenance-teams', require('./routes/maintenanceTeams'));
app.use('/api/maintenance-requests', require('./routes/maintenanceRequests'));

app.use("/api/calendar-events", calendarEventsRoute);

app.get('/', (req, res) => {
  res.json({ message: 'GearGuard API Server Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
