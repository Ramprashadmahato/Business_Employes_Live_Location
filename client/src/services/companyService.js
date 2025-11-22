import api from "./api";

/**
 * ==========================
 * Admin APIs (CRUD)
 * ==========================
 */

// Create a new company (Admin only)
// Must include `password` for company login
export const createCompany = async (data) => {
  const response = await api.post("/companies", data);
  return response.data; // { success, message, company, companyUser }
};

// Get all companies (Admin only)
export const getAllCompanies = async () => {
  const response = await api.get("/companies");
  return response.data; // { success, message, data: companies }
};

// Get single company by ID (Admin only)
export const getCompanyById = async (id) => {
  const response = await api.get(`/companies/${id}`);
  return response.data; // { success, message, data: company }
};

// Update company by ID (Admin only)
export const updateCompany = async (id, data) => {
  const response = await api.put(`/companies/${id}`, data);
  return response.data; // { success, message, data: company }
};

// Delete company by ID (Admin only)
export const deleteCompany = async (id) => {
  const response = await api.delete(`/companies/${id}`);
  return response.data; // { success, message }
};

/**
 * ==========================
 * Company Dashboard APIs
 * ==========================
 */

// Get logged-in company's own profile
export const getCompanyProfile = async () => {
  const response = await api.get("/companies/profile");
  return response.data; // { success, message, data: company }
};

// Update logged-in company's own profile
export const updateCompanyProfile = async (data) => {
  const response = await api.put("/companies/profile", data);
  return response.data; // { success, message, data: company }
};
