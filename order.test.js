const assert = require("assert");
const {
  createOrder,
  addItem,
  removeItem,
  setOrderStatus,
  calculateOrderSubtotal,
  calculateOrderTotal,
} = require("./order");

function runTests() {
  const order = createOrder({
    id: "order-1",
    customerId: "customer-1",
    items: [{ sku: "sku-a", name: "Keyboard", price: 99.99, quantity: 1 }],
  });

  assert.strictEqual(order.status, "pending");
  assert.strictEqual(order.items.length, 1);

  addItem(order, { sku: "sku-b", name: "Mouse", price: 49.5, quantity: 2 });
  assert.strictEqual(order.items.length, 2);

  addItem(order, { sku: "sku-a", name: "Keyboard", price: 99.99, quantity: 1 });
  assert.strictEqual(order.items.find((item) => item.sku === "sku-a").quantity, 2);

  const subtotal = calculateOrderSubtotal(order);
  assert.strictEqual(subtotal, 298.98);

  const total = calculateOrderTotal(order, {
    taxRate: 0.1,
    shippingFee: 10,
    discount: 5,
  });
  assert.strictEqual(total, 333.88);

  setOrderStatus(order, "paid");
  assert.strictEqual(order.status, "paid");

  removeItem(order, "sku-b");
  assert.strictEqual(order.items.length, 1);

  assert.throws(() => setOrderStatus(order, "unknown"));
  assert.throws(() => addItem(order, { sku: "", name: "Invalid", price: 10, quantity: 1 }));
}

runTests();
console.log("order tests passed");
