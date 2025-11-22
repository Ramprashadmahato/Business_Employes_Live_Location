import User from "../models/User.js";

// ---------------- Add Admin Staff ----------------
export const addAdminStaff = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    if (!permissions || permissions.length === 0) {
      return res.status(400).json({ success: false, message: "Select at least one permission" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const role = "ADMIN_STAFF";
    const user = await User.create({ name, email, password, role, permissions });

    res.status(201).json({
      success: true,
      message: "Admin Staff created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------- List Admin Staff ----------------
export const listAdminStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: "ADMIN_STAFF" }).select("name email status permissions role");
    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ---------------- Update Admin Staff ----------------
export const updateAdminStaff = async (req, res) => {
  try {
    const { userId, name, status, permissions } = req.body;

    if (!permissions || permissions.length === 0) {
      return res.status(400).json({ success: false, message: "Select at least one permission" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Admin Staff not found" });

    if (name) user.name = name;
    if (status) user.status = status;
    user.permissions = permissions;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Admin Staff updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ---------------- Delete Admin Staff ----------------
export const deleteAdminStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "Admin Staff not found" });

    res.status(200).json({ success: true, message: "Admin Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};