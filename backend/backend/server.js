const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
console.log("App listen at port 5000");
app.use(express.json());
app.use(cors());
const mongoose = require("mongoose");
mongoose.pluralize(null);
mongoose
  .connect(
    "mongodb+srv://Sparse2002:shrey14112002@cluster0.tq8pkzd.mongodb.net/Indi"
  )
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.error(err);
  });
const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    minlength:8,
    required: true,
  },
});
const User = mongoose.model("signup", UserSchema);
User.createIndexes();

const WatchList = new mongoose.Schema({
  media_type: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  usermail: {
    type: String,
    required: true,
  },
});
const Watch = mongoose.model("watchlist", WatchList);
Watch.createIndexes();

app.post("/signup", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    console.log(firstname, lastname, email, password);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ exists: "Email is aldready registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User signed up successfully." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred in signup" });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ notemail: "Mail id not found" });
    }

    const pwd = await bcrypt.compare(password, user.password);
    if (!pwd) {
      return res.status(401).json({ notpassword: "Invalid password" });
    } else {
      console.log("success");
    }

    res.json({
      message: "Login successful",
      getemail: email,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

app.post("/watchlist", async (req, res) => {
  try {
    const { media_type, id, usermail } = req.body;
    
    const existingMovie = await Watch.findOne({ usermail,id });
    console.log('the existing movie is',existingMovie)
    if (existingMovie) {
      if (existingMovie.id === parseInt(id)) {
        const movieid = existingMovie.id;
        const mailid = existingMovie.usermail;
        // console.log(movieid,mailid)
        const removeMovie = await Watch.deleteMany({ id: movieid,usermail:mailid });
        // console.log('the remove movie',removeMovie)
      }
      res.status(201).json({ removedmovie: "Movie removed successfully" });
    } else {
      const newWatch = new Watch({
        media_type,
        id,
        usermail,
      });
      await newWatch.save();
      res
        .status(201)
        .json({ message: "Movie added successfully.", added_id: id });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred in adding movie" });
  }
});

app.post("/getdata", async (req, res) => {
  try {
    const { usermail } = req.body;
    const watchlist = await Watch.find(
      { usermail },
      { media_type: 1, id: 1, _id: 0 }
    );
    console.log(watchlist);
    if (watchlist.length === 0) {
      return res.status(401).json({ nodata: "There is no data in your Watchlist" });
    } else {
      console.log("success");
    }
    res.json({
      message: "got data successfully",
      watchlist: watchlist,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

app.post("/initialdata", async (req, res) => {
  try {
    const { usermail } = req.body;
    const watchlist = await Watch.find({ usermail }, {id: 1, _id: 0 });
    
    if (watchlist.length === 0) {
      
      res.json({ nodata: "no initial data" });
    } else {
      const datalist = [];
      for (var i of watchlist) {
        datalist.push(i.id);
      }
      console.log(datalist);
      res.json({
        message: "got data successfully",
        datalist: datalist,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});
app.listen(5000);
