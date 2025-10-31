import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
     lowercase: true
  },
  password: {
    type: String,
    required: true,
  },
   classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classroom" }],
      // per-user hidden classes for toggle
      hiddenClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classroom" }],
},
{timestamps : true});

export default mongoose.model("User", userSchema);