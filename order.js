const VALID_STATUSES = ["pending", "paid", "shipped", "completed", "cancelled"];

function assertNumber(value, fieldName) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${fieldName} must be a valid number`);
  }
}

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${fieldName} must be a non-empty string`);
  }
}

function normalizeItem(item) {
  if (!item || typeof item !== "object") {
    throw new TypeError("item must be an object");
  }

  const { sku, name, price, quantity = 1 } = item;
  assertNonEmptyString(sku, "item.sku");
  assertNonEmptyString(name, "item.name");
  assertNumber(price, "item.price");
  assertNumber(quantity, "item.quantity");

  if (price < 0) {
    throw new RangeError("item.price cannot be negative");
  }
  if (quantity <= 0) {
    throw new RangeError("item.quantity must be greater than 0");
  }

  return { sku, name, price, quantity };
}

function createOrder({ id, customerId, items = [] }) {
  assertNonEmptyString(id, "id");
  assertNonEmptyString(customerId, "customerId");

  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array");
  }

  return {
    id,
    customerId,
    items: items.map(normalizeItem),
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function addItem(order, item) {
  validateOrder(order);
  const normalizedItem = normalizeItem(item);
  const existingItem = order.items.find((entry) => entry.sku === normalizedItem.sku);

  if (existingItem) {
    existingItem.quantity += normalizedItem.quantity;
  } else {
    order.items.push(normalizedItem);
  }

  order.updatedAt = new Date().toISOString();
  return order;
}

function removeItem(order, sku) {
  validateOrder(order);
  assertNonEmptyString(sku, "sku");

  const nextItems = order.items.filter((item) => item.sku !== sku);
  order.items = nextItems;
  order.updatedAt = new Date().toISOString();
  return order;
}

function setOrderStatus(order, status) {
  validateOrder(order);
  assertNonEmptyString(status, "status");

  if (!VALID_STATUSES.includes(status)) {
    throw new RangeError(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  return order;
}

function calculateOrderSubtotal(order) {
  validateOrder(order);
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calculateOrderTotal(order, { taxRate = 0, shippingFee = 0, discount = 0 } = {}) {
  validateOrder(order);
  assertNumber(taxRate, "taxRate");
  assertNumber(shippingFee, "shippingFee");
  assertNumber(discount, "discount");

  if (taxRate < 0) {
    throw new RangeError("taxRate cannot be negative");
  }
  if (shippingFee < 0) {
    throw new RangeError("shippingFee cannot be negative");
  }
  if (discount < 0) {
    throw new RangeError("discount cannot be negative");
  }

  const subtotal = calculateOrderSubtotal(order);
  const taxedAmount = subtotal * taxRate;
  const total = subtotal + taxedAmount + shippingFee - discount;

  return Number(total.toFixed(2));
}

function validateOrder(order) {
  if (!order || typeof order !== "object") {
    throw new TypeError("order must be an object");
  }
  if (!Array.isArray(order.items)) {
    throw new TypeError("order.items must be an array");
  }
}

module.exports = {
  createOrder,
  addItem,
  removeItem,
  setOrderStatus,
  calculateOrderSubtotal,
  calculateOrderTotal,
  VALID_STATUSES,
};
