# Hướng dẫn FE fetch Interaction Logs

Tài liệu này mô tả cách frontend gửi và đọc raw interaction data từ backend Express/MongoDB.

## 1. Cấu hình môi trường

Frontend dùng biến môi trường Vite:

```env
VITE_INTERACTION_API_URL=http://localhost:5500
```

Lưu ý:

- File local: `.env`
- File mẫu: `.env.example`
- Sau khi sửa `.env`, phải restart Vite dev server.
- Backend local mặc định chạy ở `http://localhost:5500`.

Kiểm tra backend:

```bash
curl http://localhost:5500/health
```

Kết quả đúng:

```json
{
  "ok": true,
  "service": "woodspec-interaction-backend"
}
```

## 2. Luồng ghi log từ FE

Khi user nhập email ở trang login:

1. FE tạo `sessionId`.
2. FE lưu auth test vào `localStorage`.
3. FE gửi session lên backend.
4. FE gửi event `login`.
5. Trong quá trình dùng app, FE gửi các event như `route_view`, `click`, `visibility_hidden`.
6. Khi user logout, FE gửi `logout` và đánh dấu session kết thúc.
7. Khi user đóng tab/rời web mà không logout, FE gửi `disconnect` bằng `navigator.sendBeacon`.

Code chính đang nằm ở:

```txt
src/services/authService.js
src/services/testSessionService.js
src/components/common/TestSessionTracker.jsx
src/services/interactionApi.js
```

## 3. Endpoint ghi log

Base URL:

```txt
${VITE_INTERACTION_API_URL}
```

### Tạo hoặc cập nhật session

```http
POST /api/interaction/session
```

Payload:

```json
{
  "sessionId": "test-1780000000000-abc123",
  "email": "tester@example.com",
  "displayName": "tester@example.com",
  "role": "tester",
  "testMode": true,
  "loginAt": 1780000000000,
  "userAgent": "Mozilla/5.0 ...",
  "timezone": "Asia/Bangkok",
  "referrer": "",
  "path": "/dashboard",
  "viewport": {
    "width": 1440,
    "height": 900
  }
}
```

Fetch mẫu:

```js
const API_URL = import.meta.env.VITE_INTERACTION_API_URL

await fetch(`${API_URL}/api/interaction/session`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
})
```

### Gửi event

```http
POST /api/interaction/events
```

Payload:

```json
{
  "sessionId": "test-1780000000000-abc123",
  "email": "tester@example.com",
  "events": [
    {
      "type": "click",
      "target": "Gửi báo giá",
      "path": "/requests/REQ-001",
      "elapsedSeconds": 42,
      "at": 1780000042000
    }
  ]
}
```

Fetch mẫu:

```js
await fetch(`${API_URL}/api/interaction/events`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    sessionId,
    email,
    events,
  }),
})
```

### Logout chủ động

```http
PATCH /api/interaction/session/:sessionId/end
```

Payload:

```json
{
  "logoutAt": 1780000100000,
  "path": "/dashboard"
}
```

Fetch mẫu:

```js
await fetch(`${API_URL}/api/interaction/session/${encodeURIComponent(sessionId)}/end`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    logoutAt: Date.now(),
    path: window.location.pathname,
  }),
})
```

### User rời web hoặc đóng tab

```http
POST /api/interaction/session/:sessionId/disconnect
```

Nên dùng `navigator.sendBeacon` vì request vẫn có cơ hội gửi khi tab đang đóng.

Payload:

```json
{
  "sessionId": "test-1780000000000-abc123",
  "email": "tester@example.com",
  "disconnectedAt": 1780000110000,
  "reason": "pagehide",
  "path": "/quotations",
  "event": {
    "type": "disconnect",
    "target": "pagehide",
    "path": "/quotations",
    "elapsedSeconds": 110,
    "at": 1780000110000
  }
}
```

Beacon mẫu:

```js
const url = `${API_URL}/api/interaction/session/${encodeURIComponent(sessionId)}/disconnect`
const payload = JSON.stringify({
  sessionId,
  email,
  disconnectedAt: Date.now(),
  reason: "pagehide",
  path: window.location.pathname,
  event: {
    type: "disconnect",
    target: "pagehide",
    path: window.location.pathname,
    elapsedSeconds,
    at: Date.now(),
  },
})

navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }))
```

## 4. Endpoint đọc log

### Lấy danh sách session

```http
GET /api/interaction/sessions?email=tester@example.com&limit=100
```

Query:

- `email`: optional, lọc theo email tester.
- `limit`: optional, mặc định `50`, tối đa `200`.

Fetch mẫu:

```js
const params = new URLSearchParams()
params.set("limit", "100")
if (email) params.set("email", email.trim().toLowerCase())

const response = await fetch(`${API_URL}/api/interaction/sessions?${params}`)
const data = await response.json()
const sessions = data.sessions || []
```

### Lấy event của một session

```http
GET /api/interaction/sessions/:sessionId/events?limit=1500
```

Query:

- `limit`: optional, mặc định `1000`, tối đa `5000`.

Fetch mẫu:

```js
const response = await fetch(
  `${API_URL}/api/interaction/sessions/${encodeURIComponent(sessionId)}/events?limit=1500`,
)
const data = await response.json()
const events = data.events || []
```

## 5. Service FE đang dùng

File đọc log:

```txt
src/services/interactionApi.js
```

API có sẵn:

```js
fetchInteractionSessions({ email, limit })
fetchInteractionEvents(sessionId, { limit })
isInteractionApiConfigured()
getInteractionApiUrl()
```

Ví dụ dùng trong page:

```js
import {
  fetchInteractionEvents,
  fetchInteractionSessions,
} from "@/services/interactionApi"

const sessions = await fetchInteractionSessions({
  email: "tester@example.com",
  limit: 100,
})

const events = await fetchInteractionEvents(sessions[0].sessionId, {
  limit: 1500,
})
```

## 6. Trang xem log

Route xem toàn bộ log:

```txt
/viewlogs
```

Route trong app/sidebar:

```txt
/interaction-logs
```

Hai route dùng chung page:

```txt
src/pages/InteractionLogsPage.jsx
```

## 7. Các event hiện tại

Frontend hiện ghi các event chính:

- `login`: bắt đầu session.
- `app_login`: email được dùng để vào app.
- `route_view`: user chuyển route.
- `click`: user click button/link/input/select.
- `visibility_hidden`: tab hoặc document bị ẩn.
- `disconnect`: user đóng tab, reload, hoặc rời web.
- `logout`: user bấm đăng xuất.

## 8. Debug nhanh

Nếu không thấy dữ liệu lên backend:

1. Kiểm tra backend đang chạy:

```bash
curl http://localhost:5500/health
```

2. Kiểm tra `.env` frontend:

```env
VITE_INTERACTION_API_URL=http://localhost:5500
```

3. Restart Vite sau khi sửa `.env`.

4. Mở DevTools Network và lọc:

```txt
/api/interaction
```

5. Kiểm tra CORS backend:

```env
CORS_ORIGIN=http://localhost:5173
```

Nếu frontend chạy port khác, thêm origin đó vào `backend/.env`, ví dụ:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:4173
```

