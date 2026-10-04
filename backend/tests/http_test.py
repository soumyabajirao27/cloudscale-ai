"""HTTP-level Phase 9 verification via requests against the running server."""
import json
import os
import sys
import urllib.error
import urllib.request

sys.path.insert(0, r"D:\PBL\backend")
BASE = "http://127.0.0.1:8001/api/v1"

PASS = 0
FAIL = 0


def check(name: str, condition: bool, detail: str = "") -> None:
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  PASS: {name}")
    else:
        FAIL += 1
        print(f"  FAIL: {name} {detail}")


def request(method: str, path: str, data=None, token: str | None = None):
    body = None
    if data is not None:
        body = json.dumps(data).encode()
    req = urllib.request.Request(f"{BASE}{path}", data=body, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())


print("\n[1] Health")
status, body = request("GET", "/health")
check("Health -> 200", status == 200, f"got {status}")

print("\n[2] Register + login")
status, body = request("POST", "/auth/register", {"full_name": "Http Test", "email": "http_test@test.com", "password": "StrongPass1"})
if status != 201:
    status, body = request("POST", "/auth/login", {"email": "http_test@test.com", "password": "StrongPass1"})
status, body = request("POST", "/auth/login", {"email": "http_test@test.com", "password": "StrongPass1"})
check("Login -> 200", status == 200, f"got {status}: {body}")
token = body["access_token"]

print("\n[3] Create resource")
status, body = request("POST", "/resources", {
    "name": "http-resource",
    "provider_type": "AWS EC2",
    "region": "us-east-1",
    "cpu_utilization": 45.0,
    "memory_utilization": 50.0,
    "storage_utilization": 30.0,
    "network_utilization": 20.0,
    "current_capacity": 2.0,
    "estimated_cost": 120.0,
}, token)
check("Create resource -> 201", status == 201, f"got {status}: {body}")
resource_id = body["id"]

print("\n[4] POST metrics")
for i in range(30):
    status, body = request("POST", f"/resources/{resource_id}/metrics", {
        "cpu_utilization": 30.0 + (i % 10) * 5.0,
        "memory_utilization": 40.0 + (i % 8) * 4.0,
        "storage_utilization": 20.0,
        "network_utilization": 15.0,
    }, token)
    if status != 201:
        check(f"POST metric {i} -> 201", False, f"got {status}: {body}")
        break
else:
    check("POST 30 metrics -> 201", True)

print("\n[5] GET metrics")
status, body = request("GET", f"/resources/{resource_id}/metrics", token=token)
check("GET metrics -> 200", status == 200, f"got {status}")
check("GET metrics count >= 30", len(body) >= 30, f"got {len(body)}")

print("\n[6] Invalid metric -> 422")
status, body = request("POST", f"/resources/{resource_id}/metrics", {"cpu_utilization": 150.0, "memory_utilization": 50.0}, token)
check("Invalid CPU -> 422", status == 422, f"got {status}")

print("\n[7] Missing JWT -> 401")
status, body = request("GET", "/resources")
check("No token -> 401", status == 401, f"got {status}")

print("\n[8] Analyze")
status, body = request("POST", f"/resources/{resource_id}/analyze", token=token)
check("Analyze -> 200", status == 200, f"got {status}: {body}")
if status == 200:
    src = body.get("analysis_source")
    check("analysis_source is valid", src in ("ml_prediction", "baseline"), f"got {src}")
    if src == "ml_prediction":
        check("predicted_cpu numeric", isinstance(body.get("predicted_cpu_utilization"), (int, float)), f"got {body.get('predicted_cpu_utilization')}")

print("\n[9] Train as non-superuser -> 403")
status, body = request("POST", "/resources/model/train", token=token)
check("Non-superuser train -> 403", status == 403, f"got {status}")

print("\n[10] Train model")
os.chdir(r"D:\PBL\backend")
from app.db.session import SessionLocal
from app.repositories.user import UserRepository

db = SessionLocal()
user_repo = UserRepository(db)
user = user_repo.get_by_email("http_test@test.com")
if user is None:
    check("Find user for promotion", False, "user not found")
else:
    user_repo.update(user, is_superuser=True)
    check("Promote user to superuser", True)
db.close()

status, body = request("POST", "/auth/login", {"email": "http_test@test.com", "password": "StrongPass1"})
token = body["access_token"]

status, body = request("POST", "/resources/model/train", token=token)
check("Train -> 200", status == 200, f"got {status}: {body}")
if status == 200:
    check("MAE present", body.get("mae") is not None, f"got {body.get('mae')}")
    check("RMSE present", body.get("rmse") is not None, f"got {body.get('rmse')}")
    check("R2 present", body.get("r2") is not None, f"got {body.get('r2')}")
    check("model_version present", body.get("model_version") is not None, f"got {body.get('model_version')}")
    print(f"      MAE={body.get('mae')} RMSE={body.get('rmse')} R2={body.get('r2')} samples={body.get('samples_used')}")

print("\n[11] Analyze (ML prediction)")
status, body = request("POST", f"/resources/{resource_id}/analyze", token=token)
check("Analyze -> 200", status == 200, f"got {status}: {body}")
if status == 200:
    check("analysis_source == ml_prediction", body.get("analysis_source") == "ml_prediction", f"got {body.get('analysis_source')}")
    check("predicted_cpu numeric", isinstance(body.get("predicted_cpu_utilization"), (int, float)), f"got {body.get('predicted_cpu_utilization')}")
    print(f"      predicted_cpu={body.get('predicted_cpu_utilization')} status={body.get('status')}")

print("\n[12] Cross-user 403")
status, body = request("POST", "/auth/register", {"full_name": "Other", "email": "other_http@test.com", "password": "StrongPass1"})
status, body = request("POST", "/auth/login", {"email": "other_http@test.com", "password": "StrongPass1"})
other_token = body["access_token"]
status, body = request("GET", f"/resources/{resource_id}", token=other_token)
check("Cross-user GET -> 403", status == 403, f"got {status}")

print("\n[13] Resource CRUD still works")
status, body = request("GET", "/resources", token=token)
check("List resources -> 200", status == 200, f"got {status}")
status, body = request("PATCH", f"/resources/{resource_id}", {"cpu_utilization": 60.0}, token)
check("Update resource -> 200", status == 200, f"got {status}")

print("\n[14] User management still works")
status, body = request("GET", "/users/me", token=token)
check("GET /users/me -> 200", status == 200, f"got {status}")

print(f"\n{'='*50}")
print(f"TOTAL: {PASS} passed, {FAIL} failed")
print(f"{'='*50}")
raise SystemExit(1 if FAIL else 0)
