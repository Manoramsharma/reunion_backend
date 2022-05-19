const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,

    useNewUrlParser: true,
  });
  console.log(`mongodb connected`);
};

module.exports = connectDB;
