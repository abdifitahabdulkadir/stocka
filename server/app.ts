import express from "express";
import { requireAdmin, requireAuth } from "./auth.js";
import { onError } from "./http.js";
import auth from "./routes/auth.js";
import { categories, customers, products, suppliers } from "./routes/catalog.js";
import { notifications, settings } from "./routes/misc.js";
import orders from "./routes/orders.js";
import purchaseOrders from "./routes/purchaseOrders.js";
import reports from "./routes/reports.js";
import stock from "./routes/stock.js";
import users from "./routes/users.js";

const app = express();
app.use("/api", express.json({ limit: "100kb" }));

// Public: setup status, first-admin registration, login, logout, current user
app.use("/api", auth);

// Everything below needs a signed-in user
app.use("/api", requireAuth);
app.use("/api/categories", categories);
app.use("/api/products", products);
app.use("/api/customers", customers);
app.use("/api/suppliers", suppliers);
app.use("/api/orders", orders);
app.use("/api/stock-movements", stock);
app.use("/api/purchase-orders", purchaseOrders);
app.use("/api/notifications", notifications);
app.use("/api/settings", settings);
app.use("/api", reports);
app.use("/api/users", requireAdmin, users);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found." });
});
app.use(onError);

export default app;
