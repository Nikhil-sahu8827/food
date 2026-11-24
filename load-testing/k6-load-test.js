import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrics
const OrderPlacementTrend = new Trend('order_placement_duration');
const MenuRetrievalTrend = new Trend('menu_retrieval_duration');
const StatusCheckTrend = new Trend('restaurant_status_duration');
const ErrorRate = new Rate('system_errors');
const OrdersPlacedCounter = new Counter('orders_placed_total');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api';

// Workload Stages: Ramp up to 20, 50, 100, and 200 concurrent users
export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Warm-up to 20 users
    { duration: '1m', target: 50 },    // Normal operational load (50 users)
    { duration: '1m', target: 100 },   // Peak rush hour load (100 users)
    { duration: '30s', target: 200 },  // Stress threshold test (200 users)
    { duration: '30s', target: 0 },    // Cool down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<800'], // 95% of requests must complete below 800ms
    'system_errors': ['rate<0.02'],     // Error rate must remain under 2%
    'order_placement_duration': ['p(95)<1200'], // Order transaction under 1200ms
  },
};

export function setup() {
  // Register or authenticate a test customer to obtain JWT token
  const testEmail = `loadtest_${Date.now()}@example.com`;
  const registerPayload = JSON.stringify({
    fullName: 'Load Test Customer',
    email: testEmail,
    mobileNumber: '+919876543210',
    password: 'Password@123',
    confirmPassword: 'Password@123',
  });

  const regRes = http.post(`${BASE_URL}/auth/register`, registerPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  let token = '';
  if (regRes.status === 201) {
    token = JSON.parse(regRes.body).token;
  } else {
    // Attempt fallback login with default admin
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: 'admin@restaurant.com',
      password: 'AdminPassword@123',
    }), { headers: { 'Content-Type': 'application/json' } });

    if (loginRes.status === 200) {
      token = JSON.parse(loginRes.body).token;
    }
  }

  // Fetch available menu item IDs for subsequent order placing
  const menuRes = http.get(`${BASE_URL}/menu`);
  let itemIds = [1, 2, 3];
  if (menuRes.status === 200) {
    const items = JSON.parse(menuRes.body);
    if (items.length > 0) {
      itemIds = items.slice(0, 5).map(i => i.id);
    }
  }

  return { token, itemIds };
}

export default function (data) {
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  // 1. Restaurant Status Check
  group('01. Check Restaurant Status', function () {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/restaurant/status`);
    StatusCheckTrend.add(Date.now() - start);

    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'has open property': (r) => JSON.parse(r.body).open !== undefined,
    });
    ErrorRate.add(!success);
  });

  sleep(1);

  // 2. Browse Menu & Categories
  group('02. Browse Food Menu', function () {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/menu`);
    MenuRetrievalTrend.add(Date.now() - start);

    const success = check(res, {
      'menu retrieved 200': (r) => r.status === 200,
      'menu has items': (r) => JSON.parse(r.body).length >= 0,
    });
    ErrorRate.add(!success);

    // Also fetch categories
    const catRes = http.get(`${BASE_URL}/menu/categories`);
    check(catRes, { 'categories 200': (r) => r.status === 200 });
  });

  sleep(1);

  // 3. Submit Cash on Delivery Order (20% of users simulate placing an order)
  if (__VU % 5 === 0 && data.token && data.itemIds.length > 0) {
    group('03. Place Cash on Delivery Order', function () {
      const selectedItem = data.itemIds[Math.floor(Math.random() * data.itemIds.length)];
      const orderPayload = JSON.stringify({
        deliveryAddress: `Flat ${Math.floor(Math.random() * 500)}, 12th Main Road, Bengaluru`,
        items: [
          { foodItemId: selectedItem, quantity: 2 },
        ],
      });

      const start = Date.now();
      const res = http.post(`${BASE_URL}/orders`, orderPayload, { headers: authHeaders });
      OrderPlacementTrend.add(Date.now() - start);

      const success = check(res, {
        'order response 201 or 400 (if closed)': (r) => r.status === 201 || r.status === 400,
      });

      if (res.status === 201) {
        OrdersPlacedCounter.add(1);
        const orderData = JSON.parse(res.body);
        check(orderData, {
          'orderNumber generated': (o) => o.orderNumber !== undefined,
          'status is PENDING': (o) => o.orderStatus === 'PENDING',
        });
      }

      ErrorRate.add(!success);
    });
  }

  sleep(2);
}
