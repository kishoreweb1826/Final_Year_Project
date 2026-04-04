from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import os
import secrets

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/ai/analyze")
async def analyze_soil(
    cropName: str = Form(""),
    soilPh: float = Form(0.0),
    moisture: float = Form(0.0),
    nitrogen: float = Form(0.0),
    phosphorus: float = Form(0.0),
    potassium: float = Form(0.0),
    temperature: float = Form(0.0),
    humidity: float = Form(0.0),
    rainfall: float = Form(0.0),
    location: str = Form(""),
    image: UploadFile = File(None)
):
    
    # 1. PROCESS IMAGE
    observation = "No image provided"
    if image is not None and image.filename != "":
        # Generate random filename to prevent collisions
        file_ext = image.filename.split('.')[-1]
        file_name = f"{secrets.token_hex(8)}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        # Save image
        with open(file_path, "wb") as buffer:
            buffer.write(await image.read())
            
        try:
            # OpenCV Processing
            img = cv2.imread(file_path)
            if img is not None:
                # Resize
                img_resized = cv2.resize(img, (256, 256))
                # Grayscale
                gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
                # Edge detection
                edges = cv2.Canny(gray, 100, 200)
                
                # Simple observation logic based on edges
                edge_intensity = np.sum(edges) / 255
                if edge_intensity > 3000: # Arbitrary threshold for "damage/disease" texture
                    observation = "Possible visible damage detected in leaf/soil texture"
                else:
                    observation = "No major visible issue found in image"
            else:
                observation = "Could not process uploaded image"
        except Exception as e:
            observation = f"Image processing error: {str(e)}"

    # 2. RULE-BASED ANALYSIS
    issues = []
    causes = []
    solutions = []
    severity_level = 0 # 0=None, 1=Low, 2=Medium, 3=High
    
    # Rules
    if soilPh < 5.5:
        issues.append("Acidic Soil")
        causes.append("Low pH levels")
        solutions.append("Apply agricultural lime to raise pH")
        severity_level = max(severity_level, 2)
        
    if soilPh > 8:
        issues.append("Alkaline Soil")
        causes.append("High pH levels")
        solutions.append("Add organic matter, elemental sulfur, or peat moss")
        severity_level = max(severity_level, 2)
        
    if nitrogen < 20:
        issues.append("Nitrogen Deficiency")
        causes.append("Depleted soil nitrogen")
        solutions.append("Apply nitrogen-rich fertilizers (e.g., Urea, Compost)")
        severity_level = max(severity_level, 3)
        
    if phosphorus < 15:
        issues.append("Phosphorus Deficiency")
        causes.append("Low phosphorus levels in soil")
        solutions.append("Use bone meal, rock phosphate, or NPK blends")
        severity_level = max(severity_level, 2)
        
    if potassium < 15:
        issues.append("Potassium Deficiency")
        causes.append("Low potassium content")
        solutions.append("Apply potash, wood ash, or kelp meal")
        severity_level = max(severity_level, 2)
        
    if moisture < 20:
        issues.append("Low Soil Moisture")
        causes.append("Inadequate irrigation or drought")
        solutions.append("Increase irrigation frequency and use mulching")
        severity_level = max(severity_level, 3)
        
    if temperature > 30 and humidity > 70:
        issues.append("High Fungal Risk")
        causes.append("Hot and humid environmental conditions")
        solutions.append("Apply preventive organic fungicides (e.g., Neem oil) and ensure good air circulation")
        severity_level = max(severity_level, 3)
        
    if rainfall > 200:
        issues.append("Waterlogging Risk")
        causes.append("Excessive rainfall")
        solutions.append("Improve field drainage channels and avoid overwatering")
        severity_level = max(severity_level, 2)
        
    # Aggregate result
    if len(issues) == 0:
        primary_issue = "Optimal Conditions"
        severity_str = "None"
        causes.append("Balanced soil nutrients and weather")
        solutions.append("Maintain current farming practices")
        confidence = 0.95
    else:
        primary_issue = issues[0] # Focus on the first detected issue as the "primary" one
        if len(issues) > 1:
            primary_issue += f" (+{len(issues)-1} more)"
            
        if severity_level == 3:
            severity_str = "High"
        elif severity_level == 2:
            severity_str = "Medium"
        else:
            severity_str = "Low"
            
        confidence = round(0.70 + (0.05 * len(issues)), 2)
        if confidence > 0.95:
            confidence = 0.95
            
    # BONUS: Recommended Products
    recommended_products = []
    
    # Map issues to products (assuming standard eCommerce products for farming)
    if "Nitrogen Deficiency" in issues or "Phosphorus Deficiency" in issues or "Potassium Deficiency" in issues:
        recommended_products.append({"name": "Premium Organic NPK Fertilizer", "price": 450, "image": "/images/fertilizer.jpg"})
        
    if "Acidic Soil" in issues:
        recommended_products.append({"name": "Agricultural Lime (5kg)", "price": 320, "image": "/images/lime.jpg"})
        
    if "High Fungal Risk" in issues:
        recommended_products.append({"name": "Organic Neem Oil Fungicide", "price": 250, "image": "/images/neemoil.jpg"})
        
    if "Low Soil Moisture" in issues:
        recommended_products.append({"name": "Drip Irrigation Starter Kit", "price": 1200, "image": "/images/drip.jpg"})

    # Ensure at least one product is recommended generally
    if len(recommended_products) == 0:
         recommended_products.append({"name": "All-Purpose Organic Compost", "price": 200, "image": "/images/compost.jpg"})

    return {
        "issue": primary_issue,
        "severity": severity_str,
        "causes": causes,
        "solutions": solutions,
        "confidence": confidence,
        "image_observation": observation,
        "products": recommended_products[:3] # Return up to 3 products
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
