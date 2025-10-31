import express from "express";
import auth from "../middleware/auth.js";
import ClassModel from "../models/Class.js";
import User from "../models/User.js";

const router = express.Router();

// Create a class (admin password required)
router.post("/", auth, async (req, res) => {
  try {
    const { name, code, adminPassword } = req.body;

    // validate input
    if (!name || !code || !adminPassword) {
      return res.status(400).json({ message: "name, code, and adminPassword required" });
    }

    if (adminPassword !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Invalid admin password" });
    }

    // check uniqueness of the code
    const existing = await ClassModel.findOne({ code: code.trim() });
    if (existing) {
      return res.status(400).json({ message: "Class code already exists" });
    }

    // create class
    const cls = await ClassModel.create({
      name: name.trim(),
      code: code.trim(),
      createdBy: req.user.id,
      members: [req.user.id], // add creator automatically
    });

    // auto add creator to the user's class list
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { classes: cls._id } });

    res.status(201).json({ _id: cls._id, name: cls.name, code: cls.code });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});


// Join a class by code
router.post("/join", auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "code required" });

    const cls = await ClassModel.findOne({ code });
    if (!cls) return res.status(404).json({ message: "Class not found" });

    await ClassModel.findByIdAndUpdate(cls._id, { $addToSet: { members: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { classes: cls._id }, $pull: { hiddenClasses: cls._id } });

    res.json({ _id: cls._id, name: cls.name, code: cls.code });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Get classes for current user
router.get("/mine", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({ path: "classes", select: "name code" });
    const classes = (user?.classes || []).map((c) => ({ _id: c._id, name: c.name, code: c.code }));
    res.json(classes);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle visibility of a class for the user
router.post("/:classId/toggle-visibility", auth, async (req, res) => {
  try {
    const { classId } = req.params;
    const user = await User.findById(req.user.id);
    const isHidden = user.hiddenClasses?.some((id) => id.toString() === classId);

    const update = isHidden
      ? { $pull: { hiddenClasses: classId } }
      : { $addToSet: { hiddenClasses: classId } };

    await User.findByIdAndUpdate(req.user.id, update);
    res.json({ hidden: !isHidden });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;