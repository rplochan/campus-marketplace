export const CATEGORIES = ["Books", "Electronics", "Furniture", "Clothing", "Cycles", "Stationery", "Other"];

export function validateRegister({ name, email, password }) {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email";
  if (!password || password.length < 8) errors.password = "Password must be at least 8 characters";
  return errors;
}

export function validateListing(b) {
  const errors = {};
  if (!b.title || b.title.trim().length < 3 || b.title.length > 100) errors.title = "Title must be 3-100 characters";
  if (!b.description || b.description.trim().length < 10 || b.description.length > 1000)
    errors.description = "Description must be 10-1000 characters";
  const price = Number(b.price);
  if (!Number.isFinite(price) || price <= 0 || price > 10000000) errors.price = "Price must be a positive number";
  if (!CATEGORIES.includes(b.category)) errors.category = "Pick a valid category";
  if (!b.image_url || !/^https:\/\//.test(b.image_url)) errors.image_url = "An image is required";
  if (b.lat != null && (typeof b.lat !== "number" || typeof b.lng !== "number")) errors.location = "Invalid location";
  return errors;
}