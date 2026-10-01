"""
ReLife AI - E-Waste Vision Model Training Pipeline
Dataset: electronic-waste-detection / balanced-e-waste-dataset / version 2 (Roboflow Universe)
Framework: Ultralytics YOLOv8 / PyTorch

Prerequisites:
  pip install roboflow ultralytics torch torchvision
"""

import os
import sys
from roboflow import Roboflow

# Configuration
ROBOFLOW_API_KEY = os.environ.get("ROBOFLOW_API_KEY", "<YOUR_ROBOFLOW_API_KEY>")
WORKSPACE_ID = "electronic-waste-detection"
PROJECT_ID = "balanced-e-waste-dataset"
DATASET_VERSION = 2

def download_dataset():
    print("📥 Connecting to Roboflow Universe...")
    if ROBOFLOW_API_KEY == "<YOUR_ROBOFLOW_API_KEY>":
        print("⚠️ Warning: Please set ROBOFLOW_API_KEY environment variable or pass your API key.")
        print("Obtain a free API key from https://app.roboflow.com/settings/api")

    rf = Roboflow(api_key=ROBOFLOW_API_KEY)
    project = rf.workspace(WORKSPACE_ID).project(PROJECT_ID)
    dataset = project.version(DATASET_VERSION).download("yolov8")
    print(f"✅ Dataset downloaded successfully to: {dataset.location}")
    return dataset.location

def train_yolo_model(dataset_location: str, epochs: int = 50, batch_size: int = 16):
    try:
        from ultralytics import YOLO
    except ImportError:
        print("❌ Error: ultralytics package not installed. Run: pip install ultralytics")
        sys.exit(1)

    data_yaml = os.path.join(dataset_location, "data.yaml")
    if not os.path.exists(data_yaml):
        print(f"❌ Error: data.yaml not found at {data_yaml}")
        sys.exit(1)

    print("\n🧠 Initializing YOLOv8 nano model for E-Waste detection...")
    model = YOLO("yolov8n.pt")  # Load pre-trained COCO backbone

    print(f"🚀 Training E-Waste vision model for {epochs} epochs...")
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=640,
        batch=batch_size,
        name="relife_ewaste_model",
        save=True,
        plots=True
    )

    print("\n📊 Evaluating trained model performance...")
    metrics = model.val()
    print(f"  mAP50-95: {metrics.box.map}")
    print(f"  Precision: {metrics.box.mp}")
    print(f"  Recall: {metrics.box.mr}")

    # Export model to ONNX for lightweight production inference
    onnx_path = model.export(format="onnx")
    print(f"✅ Trained model exported to ONNX: {onnx_path}")

    weights_path = os.path.join(model.trainer.save_dir, "weights", "best.pt")
    print(f"🏆 Best model weights saved at: {weights_path}")
    return weights_path

if __name__ == "__main__":
    print("=" * 60)
    print(" ReLife AI - E-Waste Dataset (v2) Model Training Script ")
    print("=" * 60)
    
    try:
        loc = download_dataset()
        train_yolo_model(loc, epochs=50)
    except Exception as e:
        print(f"\n❌ Pipeline execution error: {e}")
        print("\nNote: You can run this script directly on Google Colab or a GPU server with:")
        print("  python scripts/train_ewaste_model.py")
