
const express = require('express');
const mongoose = require('mongoose');
const Progress = require('./models/Progress');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static('../client'));



mongoose.connect(
  "mongodb+srv://sendtoshatvik:I5nUrml&@cluster0.b9a4jds.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB Atlas");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});


app.get('/progress/:userId/:videoId', async (req, res) => {
  const { userId, videoId } = req.params;
  const record = await Progress.findOne({ userId, videoId });
  res.json(record || {});
});

app.post('/progress', async (req, res) => {
  const { userId, videoId, intervals, lastPosition, progress } = req.body;
  let record = await Progress.findOne({ userId, videoId });
  if (record) {
    record.intervals = intervals;
    record.lastPosition = lastPosition;
    record.progress = progress;
    await record.save();
  } else {
    record = await Progress.create({ userId, videoId, intervals, lastPosition, progress });
  }
  res.json({ message: 'Progress saved', progress });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
