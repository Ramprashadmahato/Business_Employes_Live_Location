import api from "./api";

export const createAdminStaff = async (adminData) => {
  try {
    const { data } = await api.post("/admin/add", adminData);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export const getAllAdminStaff = async () => {
  try {
    const { data } = await api.get("/admin/list");
    return data.staff;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export const updateAdminStaff = async (adminId, updateData) => {
  try {
    const { data } = await api.put("/admin/update", { userId: adminId, ...updateData });
    return data.user;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export const deleteAdminStaff = async (adminId) => {
  try {
    const { data } = await api.delete(`/admin/${adminId}`);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};