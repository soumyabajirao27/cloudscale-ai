"""Final Phase 9 verification: fallback + insufficient data handling."""
import json
import os
import sys
import urllib.error
import urllib.request

sys.path.insert(0, r"D:\PBL\backend")
BASE = "http://127.0.0.1:8000/api/v1"

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


print("\n[1] Baseline fallback for resource with no metrics")
status, r = request("POST", "/auth/login", {"email": "other_http@test.com", "password": "StrongPass1"})
bob_token = r["access_token"]
status, r = request("GET", "/resources", token=bob_token)
bob_resource_id = r[0]["id"] if r else None
if bob_resource_id is None:
    # Create a resource for other_http with no metrics
    status, r = request("POST", "/resources", {
        "name": "other-no-metrics",
        "provider_type": "AWS EC2",
        "region": "us-east-1",
        "cpu_utilization": 45.0,
        "memory_utilization": 50.0,
        "storage_utilization": 30.0,
        "network_utilization": 20.0,
        "current_capacity": 2.0,
        "estimated_cost": 120.0,
    }, bob_token)
    bob_resource_id = r["id"] if status == 201 else None

if bob_resource_id:
    status, r = request("POST", f"/resources/{bob_resource_id}/analyze", token=bob_token)
    check("Analyze no-metrics -> 200", status == 200, f"got {status}")
    check("analysis_source == baseline", r.get("analysis_source") == "baseline", f"got {r.get('analysis_source')}")
    check("predicted_cpu is None", r.get("predicted_cpu_utilization") is None, f"got {r.get('predicted_cpu_utilization')}")
else:
    check("Found other resource", False, "no resource found")


print("\n[2] Insufficient data raises ValueError in trainer")
os.chdir(r"D:\PBL\backend")
from app.db.session import SessionLocal
from app.ml.trainer import train_demand_model
from app.ml.features import prepare_features
from app.models.metric import ResourceMetric
from app.repositories.metric import MetricRepository

db = SessionLocal()
metric_repo = MetricRepository(db)
all_metrics = metric_repo.get_all()
if len(all_metrics) >= 2:
    try:
        train_demand_model(all_metrics[:2], min_samples=10)
        check("Insufficient data raises ValueError", False, "no exception")
    except ValueError:
        check("Insufficient data raises ValueError", True)
else:
    check("Enough metrics for test", False, f"only {len(all_metrics)} metrics")
db.close()


print(f"\n{'='*50}")
print(f"TOTAL: {PASS} passed, {FAIL} failed")
print(f"{'='*50}")
raise SystemExit(1 if FAIL else 0)
