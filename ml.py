# import sys
# import json
# import random
# import numpy as np

# def simulate_ml_analysis(data):
#     # print("ML model received input from server.")  # ✅ Safe confirmation

#     damage_probability = round(random.uniform(40, 95), 2)
#     damage_type = {
#         data["damageType"].split()[0]: round(random.uniform(50, 80), 2),
#         "Pest": round(random.uniform(10, 40), 2)
#     }
#     severity = round(random.uniform(30, 90), 2)
#     affected_area = round(random.uniform(1.5, 6.0), 2)

#     crop_health_index = [round(random.uniform(0.1, 0.9), 2) for _ in range(36)]
#     soil_moisture_anomaly = [round(random.uniform(-0.5, 0.5), 2) for _ in range(36)]
#     pest_likelihood_grid = [round(random.uniform(0.0, 1.0), 2) for _ in range(36)]

#     yield_loss = round(random.uniform(10, 60), 2)
#     estimated_payout = round(yield_loss * 1500, 0)
#     recovery_time = random.randint(4, 12)

#     model_confidence = round(random.uniform(60, 95), 2)
#     claim_eligibility = "Likely Eligible" if severity > 50 and model_confidence > 60 else "Needs Manual Review"
#     growth_stage = data["growthStage"]
#     growth_confidence = round(random.uniform(60, 90), 2)

#     geojson_polygon = {
#         "type": "Polygon",
#         "coordinates": [[[data["longitude"], data["latitude"]],
#                          [data["longitude"] + 0.01, data["latitude"]],
#                          [data["longitude"] + 0.01, data["latitude"] + 0.01],
#                          [data["longitude"], data["latitude"] + 0.01],
#                          [data["longitude"], data["latitude"]]]]
#     }

#     result = {
#         "farmerName": data["farmerName"],
#         "cropType": data["cropType"],
#         "latitude": float(data["latitude"]),
#         "longitude": float(data["longitude"]),
#         "location": data["location"],
#         "damageProbability": damage_probability,
#         "damageType": damage_type,
#         "severity": severity,
#         "affectedArea": affected_area,
#         "cropHealthIndex": crop_health_index,
#         "soilMoistureAnomaly": soil_moisture_anomaly,
#         "pestInfestationLikelihood": pest_likelihood_grid,
#         "yieldLoss": yield_loss,
#         "estimatedPayout": estimated_payout,
#         "recoveryTime": recovery_time,
#         "modelConfidence": model_confidence,
#         "claimEligibility": claim_eligibility,
#         "growthStageConfirmation": {
#             "stage": growth_stage,
#             "confidence": growth_confidence
#         },
#         "geospatialFootprint": geojson_polygon
#     }
   

#     # print("ML model generated output successfully.")  # ✅ Safe confirmation
#     return result
# print("ML model received input from server.", file=sys.stderr)


# if __name__ == "__main__":
#     input_json = sys.stdin.read()
#     data = json.loads(input_json)
#     result = simulate_ml_analysis(data)
#     print(json.dumps(result))

# import sys
# import json
# import random
# import numpy as np
# import os

# from googleapiclient.discovery import build
# from googleapiclient.http import MediaIoBaseDownload
# from google.oauth2 import service_account
# import io
# from dotenv import load_dotenv
# load_dotenv()


# # -----------------------------
# # Google Drive Setup
# # -----------------------------
# # FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
# FOLDER_ID = os.getenv("13HMcPaY8QvnxaQyB8600VCoE8u6k3i9X")
# # SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
# SERVICE_ACCOUNT_FILE = os.getenv("cropic-prototype-4f2d0f8dd777.json")

# SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
# credentials = service_account.Credentials.from_service_account_file(
#     SERVICE_ACCOUNT_FILE, scopes=SCOPES
# )
# drive_service = build("drive", "v3", credentials=credentials)

# def list_drive_files(folder_id):
#     """List files inside Google Drive datasets folder."""
#     results = drive_service.files().list(
#         q=f"'{folder_id}' in parents",
#         fields="files(id, name)"
#     ).execute()
#     return results.get("files", [])

# def download_file(file_id, file_name):
#     """Download file from Google Drive (if needed for analysis)."""
#     request = drive_service.files().get_media(fileId=file_id)
#     fh = io.BytesIO()
#     downloader = MediaIoBaseDownload(fh, request)
#     done = False
#     while not done:
#         status, done = downloader.next_chunk()
#     fh.seek(0)
#     print(f"Downloaded {file_name} from Google Drive", file=sys.stderr)
#     return fh.read()

# # -----------------------------
# # ML Simulation Logic (unchanged)
# # -----------------------------
# def simulate_ml_analysis(data):
#     # Example: list files in datasets folder
#     files = list_drive_files(FOLDER_ID)
#     print(f"📂 Found {len(files)} files in Google Drive datasets folder.", file=sys.stderr)

#     damage_probability = round(random.uniform(40, 95), 2)
#     damage_type = {
#         data["damageType"].split()[0]: round(random.uniform(50, 80), 2),
#         "Pest": round(random.uniform(10, 40), 2)
#     }
#     severity = round(random.uniform(30, 90), 2)
#     affected_area = round(random.uniform(1.5, 6.0), 2)

#     crop_health_index = [round(random.uniform(0.1, 0.9), 2) for _ in range(36)]
#     soil_moisture_anomaly = [round(random.uniform(-0.5, 0.5), 2) for _ in range(36)]
#     pest_likelihood_grid = [round(random.uniform(0.0, 1.0), 2) for _ in range(36)]

#     yield_loss = round(random.uniform(10, 60), 2)
#     estimated_payout = round(yield_loss * 1500, 0)
#     recovery_time = random.randint(4, 12)

#     model_confidence = round(random.uniform(60, 95), 2)
#     claim_eligibility = "Likely Eligible" if severity > 50 and model_confidence > 60 else "Needs Manual Review"
#     growth_stage = data["growthStage"]
#     growth_confidence = round(random.uniform(60, 90), 2)

#     geojson_polygon = {
#         "type": "Polygon",
#         "coordinates": [[[data["longitude"], data["latitude"]],
#                          [data["longitude"] + 0.01, data["latitude"]],
#                          [data["longitude"] + 0.01, data["latitude"] + 0.01],
#                          [data["longitude"], data["latitude"] + 0.01],
#                          [data["longitude"], data["latitude"]]]]
#     }

#     result = {
#         "farmerName": data["farmerName"],
#         "cropType": data["cropType"],
#         "latitude": float(data["latitude"]),
#         "longitude": float(data["longitude"]),
#         "location": data["location"],
#         "damageProbability": damage_probability,
#         "damageType": damage_type,
#         "severity": severity,
#         "affectedArea": affected_area,
#         "cropHealthIndex": crop_health_index,
#         "soilMoistureAnomaly": soil_moisture_anomaly,
#         "pestInfestationLikelihood": pest_likelihood_grid,
#         "yieldLoss": yield_loss,
#         "estimatedPayout": estimated_payout,
#         "recoveryTime": recovery_time,
#         "modelConfidence": model_confidence,
#         "claimEligibility": claim_eligibility,
#         "growthStageConfirmation": {
#             "stage": growth_stage,
#             "confidence": growth_confidence
#         },
#         "geospatialFootprint": geojson_polygon
#     }
#     return result

# print("ML model received input from server.", file=sys.stderr)

# if __name__ == "__main__":
#     input_json = sys.stdin.read()
#     data = json.loads(input_json)
#     result = simulate_ml_analysis(data)
#     print(json.dumps(result))


import sys
import json
import random
import numpy as np
import os
import io

from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2 import service_account
# from dotenv import load_dotenv

# # ✅ Load environment variables from .env file
# load_dotenv()

# -----------------------------
# Google Drive Setup
# -----------------------------
FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
drive_service = build("drive", "v3", credentials=credentials)

def list_drive_files(folder_id):
    """List files inside Google Drive datasets folder."""
    results = drive_service.files().list(
        q=f"'{folder_id}' in parents",
        fields="files(id, name)"
    ).execute()
    return results.get("files", [])

def download_file(file_id, file_name):
    """Download file from Google Drive (if needed for analysis)."""
    request = drive_service.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    fh.seek(0)
    print(f"Downloaded {file_name} from Google Drive", file=sys.stderr)
    return fh.read()

# -----------------------------
# ML Simulation Logic (unchanged)
# -----------------------------
def simulate_ml_analysis(data):
    files = list_drive_files(FOLDER_ID)
    print(f"📂 Found {len(files)} files in Google Drive datasets folder.", file=sys.stderr)

    damage_probability = round(random.uniform(40, 95), 2)
    damage_type = {
        data["damageType"].split()[0]: round(random.uniform(50, 80), 2),
        "Pest": round(random.uniform(10, 40), 2)
    }
    severity = round(random.uniform(30, 90), 2)
    affected_area = round(random.uniform(1.5, 6.0), 2)

    crop_health_index = [round(random.uniform(0.1, 0.9), 2) for _ in range(36)]
    soil_moisture_anomaly = [round(random.uniform(-0.5, 0.5), 2) for _ in range(36)]
    pest_likelihood_grid = [round(random.uniform(0.0, 1.0), 2) for _ in range(36)]

    yield_loss = round(random.uniform(10, 60), 2)
    estimated_payout = round(yield_loss * 1500, 0)
    recovery_time = random.randint(4, 12)

    model_confidence = round(random.uniform(60, 95), 2)
    claim_eligibility = "Likely Eligible" if severity > 50 and model_confidence > 60 else "Needs Manual Review"
    growth_stage = data["growthStage"]
    growth_confidence = round(random.uniform(60, 90), 2)

    geojson_polygon = {
        "type": "Polygon",
        "coordinates": [[[data["longitude"], data["latitude"]],
                         [data["longitude"] + 0.01, data["latitude"]],
                         [data["longitude"] + 0.01, data["latitude"] + 0.01],
                         [data["longitude"], data["latitude"] + 0.01],
                         [data["longitude"], data["latitude"]]]]
    }

    result = {
        "farmerName": data["farmerName"],
        "cropType": data["cropType"],
        "latitude": float(data["latitude"]),
        "longitude": float(data["longitude"]),
        "location": data["location"],
        "damageProbability": damage_probability,
        "damageType": damage_type,
        "severity": severity,
        "affectedArea": affected_area,
        "cropHealthIndex": crop_health_index,
        "soilMoistureAnomaly": soil_moisture_anomaly,
        "pestInfestationLikelihood": pest_likelihood_grid,
        "yieldLoss": yield_loss,
        "estimatedPayout": estimated_payout,
        "recoveryTime": recovery_time,
        "modelConfidence": model_confidence,
        "claimEligibility": claim_eligibility,
        "growthStageConfirmation": {
            "stage": growth_stage,
            "confidence": growth_confidence
        },
        "geospatialFootprint": geojson_polygon
    }
    return result

print("ML model received input from server.", file=sys.stderr)

if __name__ == "__main__":
    input_json = sys.stdin.read()
    data = json.loads(input_json)
    result = simulate_ml_analysis(data)
    print(json.dumps(result))
