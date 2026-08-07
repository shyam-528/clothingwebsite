/**
 * Cart regression test — runs against the live server.
 *
 * Background: the cart was silently dropping because the User schema had no
 * `cart` field, so Mongoose strict mode threw away the data on save. The
 * controller returned the in-memory doc and the UI showed "added" — but the
 * doc was never persisted, so a refetch came back empty.
 *
 * This test fails loudly if the same regression sneaks back in.
 *
 * Run:  npm run test:cart
 * Exit code 0 on success, 1 on failure.
 */

const BASE = process.env.API_BASE || 'http://localhost:5000';

const fetchJson = async (url, opts = {}) => {
  const r = await fetch(url, opts);
  const body = await r.text();
  let parsed;
  try { parsed = JSON.parse(body); } catch { parsed = body; }
  return { status: r.status, body: parsed };
};

const assert = (cond, msg) => {
  if (!cond) {
    console.error(`✗ ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ ${msg}`);
  }
};

(async () => {
  console.log('\n=== Cart regression test ===\n');

  // 1. Login as demo user
  const login = await fetchJson(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@urbanthreads.com', password: 'Demo@123' }),
  });
  assert(login.status === 200, 'demo user login succeeds');
  const token = login.body.token;
  const auth = { Authorization: 'Bearer ' + token };

  // 2. Get a product
  const products = await fetchJson(`${BASE}/api/products?limit=1`);
  assert(products.status === 200 && products.body.items?.[0], 'products list returns at least one item');
  const product = products.body.items[0];

  // 3. Clear cart
  await fetchJson(`${BASE}/api/cart/clear`, { method: 'DELETE', headers: auth });

  // 4. Add to cart
  const add = await fetchJson(`${BASE}/api/cart/add`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: product.id,
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 1,
    }),
  });
  assert(add.status === 201, 'POST /cart/add returns 201');
  assert(add.body.itemCount === 1, 'add response shows itemCount=1');
  assert(add.body.items?.length === 1, 'add response shows 1 line');

  // 5. THE CRITICAL TEST: re-fetch cart from a fresh DB read
  const refetch = await fetchJson(`${BASE}/api/cart`, { headers: auth });
  assert(refetch.status === 200, 'GET /cart returns 200');
  assert(refetch.body.itemCount === 1, 'refetch shows itemCount=1 (data was persisted)');
  assert(refetch.body.items?.[0]?.product?.id === product.id, 'refetch returns the same product');

  // 6. Add the same line again — should increment, not duplicate
  const add2 = await fetchJson(`${BASE}/api/cart/add`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: product.id,
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 2,
    }),
  });
  assert(add2.body.itemCount === 3, 'duplicate add increments quantity (itemCount=3)');
  assert(add2.body.items?.length === 1, 'still one line (no duplicate row)');

  // 7. Add a different line — should create a new row
  const add3 = await fetchJson(`${BASE}/api/cart/add`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: product.id,
      size: product.sizes[1] || product.sizes[0],
      color: product.colors[1] || product.colors[0],
      quantity: 1,
    }),
  });
  assert(add3.body.itemCount === 4, 'different line adds to itemCount (itemCount=4)');
  assert(add3.body.items?.length === 2, 'two distinct lines now exist');

  // 8. Reject invalid size
  const bad = await fetchJson(`${BASE}/api/cart/add`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: product.id,
      size: 'XXXL',
      color: 'Mars Green',
      quantity: 1,
    }),
  });
  assert(bad.status === 400, 'invalid size rejected with 400');

  // 9. Update quantity to 0 removes the line
  const upd = await fetchJson(`${BASE}/api/cart/update`, {
    method: 'PUT',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: product.id,
      size: add3.body.items[1].size,
      color: add3.body.items[1].color,
      quantity: 0,
    }),
  });
  assert(upd.body.items.length === 1, 'quantity=0 removes that line');

  // 10. Clear cart
  const cleared = await fetchJson(`${BASE}/api/cart/clear`, { method: 'DELETE', headers: auth });
  assert(cleared.body.itemCount === 0, 'clear empties the cart');

  console.log('\n' + (process.exitCode ? '❌ Some checks failed' : '✅ All cart checks passed'));
  process.exit(process.exitCode || 0);
})().catch((e) => {
  console.error('Test runner crashed:', e);
  process.exit(2);
});
