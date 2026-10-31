import express from "express";
import { requireAdmin, requireAuth } from "./auth";
import { onError } from "./http";
import auth from "./routes/auth";
import { categories, customers, products, suppliers } from "./routes/catalog";
import { notifications, settings } from "./routes/misc";
import orders from "./routes/orders";
import purchaseOrders from "./routes/purchaseOrders";
import reports from "./routes/reports";
import stock from "./routes/stock";
import users from "./routes/users";

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
