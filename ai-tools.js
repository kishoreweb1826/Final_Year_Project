// AI Tools JavaScript - Connects to Flask AI Backend

const AI_API_URL =
  window.OrganicFarm?.AI_API_URL || "http://localhost:5000/api";

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  initializeCropRecommendation();
  initializeResourceManagement();
  initializeWeatherForecast();
  initializeSoilAnalysis();
});

// ============ CROP RECOMMENDATION ============
function initializeCropRecommendation() {
  const form = document.getElementById("cropRecommendationForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      nitrogen: parseFloat(document.getElementById("nitrogen").value),
      phosphorus: parseFloat(document.getElementById("phosphorus").value),
      potassium: parseFloat(document.getElementById("potassium").value),
      temperature: parseFloat(document.getElementById("temperature").value),
      humidity: parseFloat(document.getElementById("humidity").value),
      ph: parseFloat(document.getElementById("ph").value),
      rainfall: parseFloat(document.getElementById("rainfall").value),
      location: document.getElementById("location").value,
    };

    showLoading("cropLoading");
    hideElement("cropResults");

    try {
      // Simulate API call - Replace with actual API when backend is ready
      // const response = await fetch(`${AI_API_URL}/crop-recommendation`, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(data)
      // });
      // const result = await response.json();

      // Simulated response
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const result = getCropRecommendation(data);

      displayCropResults(result);
    } catch (error) {
      console.error("Error:", error);
      showNotification(
        "Failed to get recommendations. Please try again.",
        "danger",
      );
    } finally {
      hideLoading("cropLoading");
    }
  });
}

// Simulated crop recommendation logic (replace with actual ML model)
function getCropRecommendation(data) {
  const crops = [
    {
      name: "Rice",
      confidence: 0.92,
      reason: "Optimal NPK ratio and high rainfall",
    },
    {
      name: "Wheat",
      confidence: 0.75,
      reason: "Good temperature and pH levels",
    },
    { name: "Cotton", confidence: 0.68, reason: "Suitable climate conditions" },
  ];

  // Simple logic based on conditions
  if (data.rainfall > 200) {
    crops[0] = {
      name: "Rice",
      confidence: 0.95,
      reason: "High rainfall ideal for rice cultivation",
    };
  } else if (data.temperature < 25) {
    crops[0] = {
      name: "Wheat",
      confidence: 0.9,
      reason: "Cool temperature perfect for wheat",
    };
  } else if (data.ph > 7) {
    crops[0] = {
      name: "Cotton",
      confidence: 0.88,
      reason: "Alkaline soil suits cotton",
    };
  }

  return {
    recommended_crops: crops
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3),
    soil_health: data.ph >= 6 && data.ph <= 7.5 ? "Good" : "Needs Improvement",
    recommendations: [
      "Consider crop rotation for better soil health",
      "Monitor pH levels regularly",
      "Use organic fertilizers to maintain soil quality",
    ],
  };
}

// Display crop recommendation results
function displayCropResults(result) {
  const container = document.getElementById("recommendedCrops");

  let html = '<div class="row g-3 mb-4">';
  result.recommended_crops.forEach((crop, index) => {
    const percentage = (crop.confidence * 100).toFixed(0);
    html += `
            <div class="col-md-4">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <div class="mb-3">
                            ${index === 0 ? '<i class="fas fa-trophy fa-2x text-warning"></i>' : '<i class="fas fa-seedling fa-2x text-success"></i>'}
                        </div>
                        <h5 class="card-title">${crop.name}</h5>
                        <div class="progress mb-2" style="height: 10px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${percentage}%"></div>
                        </div>
                        <p class="mb-2"><strong>${percentage}% Match</strong></p>
                        <p class="text-muted small">${crop.reason}</p>
                    </div>
                </div>
            </div>
        `;
  });
  html += "</div>";

  html += `
        <div class="alert alert-info">
            <h6><i class="fas fa-info-circle"></i> Soil Health: ${result.soil_health}</h6>
        </div>
        <h6 class="mb-3">Additional Recommendations:</h6>
        <ul class="list-unstyled">
            ${result.recommendations.map((rec) => `<li><i class="fas fa-check-circle text-success me-2"></i>${rec}</li>`).join("")}
        </ul>
    `;

  container.innerHTML = html;
  showElement("cropResults");
}

// ============ RESOURCE MANAGEMENT ============
function initializeResourceManagement() {
  const form = document.getElementById("resourceManagementForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      crop_type: document.getElementById("cropType").value,
      farm_area: parseFloat(document.getElementById("farmArea").value),
      growth_stage: document.getElementById("growthStage").value,
      soil_moisture: parseFloat(document.getElementById("soilMoisture").value),
      days_since_irrigation: parseInt(
        document.getElementById("daysSinceIrrigation").value,
      ),
      irrigation_method: document.getElementById("irrigationMethod").value,
    };

    showLoading("resourceLoading");
    hideElement("resourceResults");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const result = calculateResources(data);

      displayResourceResults(result);
    } catch (error) {
      console.error("Error:", error);
      showNotification(
        "Failed to calculate resources. Please try again.",
        "danger",
      );
    } finally {
      hideLoading("resourceLoading");
    }
  });
}

// Calculate resource requirements (simulated)
function calculateResources(data) {
  // Base calculations (these would come from ML model in production)
  const waterRequirement = {
    rice: 1500,
    wheat: 450,
    maize: 500,
    cotton: 700,
    sugarcane: 2000,
    vegetables: 400,
  };

  const baseWater = waterRequirement[data.crop_type] || 500;
  const waterNeeded = (
    (baseWater * data.farm_area * (100 - data.soil_moisture)) /
    100
  ).toFixed(0);

  const fertilizerNeed = (data.farm_area * 50).toFixed(0); // 50kg per acre baseline

  return {
    water: {
      amount: waterNeeded,
      unit: "liters",
      frequency:
        data.growth_stage === "flowering" ? "Every 2 days" : "Every 3-4 days",
      method: data.irrigation_method,
    },
    fertilizer: {
      nitrogen: (fertilizerNeed * 0.4).toFixed(0),
      phosphorus: (fertilizerNeed * 0.3).toFixed(0),
      potassium: (fertilizerNeed * 0.3).toFixed(0),
      unit: "kg",
    },
    schedule: [
      {
        task: "Irrigation",
        timing:
          data.days_since_irrigation >= 3 ? "Urgent - Today" : "Within 2 days",
      },
      {
        task: "Fertilizer Application",
        timing: "Weekly during " + data.growth_stage,
      },
      { task: "Pest Monitoring", timing: "Daily inspection" },
      { task: "Weed Control", timing: "Bi-weekly" },
    ],
    cost_estimate: {
      water: (waterNeeded * 0.05).toFixed(0),
      fertilizer: (fertilizerNeed * 25).toFixed(0),
      labor: (data.farm_area * 200).toFixed(0),
      total: (
        waterNeeded * 0.05 +
        fertilizerNeed * 25 +
        data.farm_area * 200
      ).toFixed(0),
    },
  };
}

// Display resource management results
function displayResourceResults(result) {
  const container = document.getElementById("resourceRecommendations");

  const html = `
        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <div class="card bg-light">
                    <div class="card-body">
                        <h6><i class="fas fa-tint text-primary"></i> Water Requirements</h6>
                        <h4 class="text-primary mb-2">${result.water.amount} ${result.water.unit}</h4>
                        <p class="mb-1"><strong>Frequency:</strong> ${result.water.frequency}</p>
                        <p class="mb-0"><strong>Method:</strong> ${result.water.method}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card bg-light">
                    <div class="card-body">
                        <h6><i class="fas fa-leaf text-success"></i> Fertilizer Requirements</h6>
                        <p class="mb-1">Nitrogen (N): ${result.fertilizer.nitrogen} ${result.fertilizer.unit}</p>
                        <p class="mb-1">Phosphorus (P): ${result.fertilizer.phosphorus} ${result.fertilizer.unit}</p>
                        <p class="mb-0">Potassium (K): ${result.fertilizer.potassium} ${result.fertilizer.unit}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <h6 class="mb-3">Farm Management Schedule</h6>
        <div class="table-responsive mb-4">
            <table class="table table-bordered">
                <thead class="table-success">
                    <tr>
                        <th>Task</th>
                        <th>Timing</th>
                    </tr>
                </thead>
                <tbody>
                    ${result.schedule
                      .map(
                        (item) => `
                        <tr>
                            <td>${item.task}</td>
                            <td>${item.timing}</td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
        
        <div class="card bg-light">
            <div class="card-body">
                <h6 class="mb-3"><i class="fas fa-rupee-sign"></i> Cost Estimate</h6>
                <div class="row">
                    <div class="col-6 col-md-3 mb-2">
                        <small class="text-muted">Water</small>
                        <p class="mb-0 fw-bold">₹${result.cost_estimate.water}</p>
                    </div>
                    <div class="col-6 col-md-3 mb-2">
                        <small class="text-muted">Fertilizer</small>
                        <p class="mb-0 fw-bold">₹${result.cost_estimate.fertilizer}</p>
                    </div>
                    <div class="col-6 col-md-3 mb-2">
                        <small class="text-muted">Labor</small>
                        <p class="mb-0 fw-bold">₹${result.cost_estimate.labor}</p>
                    </div>
                    <div class="col-6 col-md-3 mb-2">
                        <small class="text-muted">Total</small>
                        <p class="mb-0 fw-bold text-success">₹${result.cost_estimate.total}</p>
                    </div>
                </div>
            </div>
        </div>
    `;

  container.innerHTML = html;
  showElement("resourceResults");
}

// ============ WEATHER FORECAST ============
function initializeWeatherForecast() {
  const form = document.getElementById("weatherForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const location = document.getElementById("weatherLocation").value;

    // Simulated weather data
    const weatherData = generateWeatherData();
    displayWeatherForecast(weatherData);
  });
}

function generateWeatherData() {
  const days = [
    "Today",
    "Tomorrow",
    "Day 3",
    "Day 4",
    "Day 5",
    "Day 6",
    "Day 7",
  ];
  return days.map((day, index) => ({
    day: day,
    temp_high: 28 + Math.floor(Math.random() * 8),
    temp_low: 18 + Math.floor(Math.random() * 5),
    humidity: 60 + Math.floor(Math.random() * 30),
    rainfall: Math.random() > 0.6 ? Math.floor(Math.random() * 50) : 0,
    condition: Math.random() > 0.5 ? "Sunny" : "Cloudy",
  }));
}

function displayWeatherForecast(data) {
  const container = document.getElementById("weatherCards");

  const html = data
    .map(
      (day) => `
        <div class="col-md-6 col-lg-4">
            <div class="card">
                <div class="card-body text-center">
                    <h6 class="mb-3">${day.day}</h6>
                    <i class="fas fa-${day.condition === "Sunny" ? "sun" : "cloud"} fa-3x text-warning mb-3"></i>
                    <h4 class="mb-2">${day.temp_high}°C / ${day.temp_low}°C</h4>
                    <p class="mb-1"><i class="fas fa-tint"></i> Humidity: ${day.humidity}%</p>
                    ${day.rainfall > 0 ? `<p class="mb-0 text-primary"><i class="fas fa-cloud-rain"></i> Rainfall: ${day.rainfall}mm</p>` : ""}
                </div>
            </div>
        </div>
    `,
    )
    .join("");

  container.innerHTML = html;
  showElement("weatherResults");
}

// ============ SOIL ANALYSIS ============
function initializeSoilAnalysis() {
  const form = document.getElementById("soilAnalysisForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      soil_type: document.getElementById("soilType").value,
      organic_matter: parseFloat(
        document.getElementById("organicMatter").value,
      ),
      ph: parseFloat(document.getElementById("soilPh").value),
      ec: parseFloat(document.getElementById("ec").value) || 0,
      cec: parseFloat(document.getElementById("cec").value) || 0,
      previous_crop: document.getElementById("previousCrop").value,
    };

    const result = analyzeSoil(data);
    displaySoilResults(result);
  });
}

function analyzeSoil(data) {
  let health_score = 70;
  const issues = [];
  const recommendations = [];

  // pH analysis
  if (data.ph < 6.0) {
    issues.push("Soil is acidic");
    recommendations.push("Add lime to increase pH");
    health_score -= 10;
  } else if (data.ph > 7.5) {
    issues.push("Soil is alkaline");
    recommendations.push("Add sulfur or organic matter to decrease pH");
    health_score -= 10;
  }

  // Organic matter
  if (data.organic_matter < 3) {
    issues.push("Low organic matter content");
    recommendations.push("Incorporate compost and green manure");
    health_score -= 15;
  }

  if (issues.length === 0) {
    recommendations.push("Soil health is good - maintain current practices");
    recommendations.push("Continue crop rotation");
  }

  return {
    health_score: Math.max(health_score, 40),
    soil_type: data.soil_type,
    issues: issues.length > 0 ? issues : ["No major issues detected"],
    recommendations: recommendations,
    suitable_crops: getSuitableCrops(data.soil_type, data.ph),
  };
}

function getSuitableCrops(soilType, ph) {
  const crops = {
    loamy: ["Most vegetables", "Grains", "Fruits"],
    clay: ["Rice", "Wheat", "Cabbage"],
    sandy: ["Carrots", "Potatoes", "Groundnuts"],
    silt: ["Vegetables", "Fruits", "Grasses"],
    peaty: ["Berries", "Root vegetables"],
  };

  return crops[soilType] || ["Consult agricultural expert"];
}

function displaySoilResults(result) {
  const container = document.getElementById("soilRecommendations");

  const healthColor =
    result.health_score >= 70
      ? "success"
      : result.health_score >= 50
        ? "warning"
        : "danger";

  const html = `
        <div class="text-center mb-4">
            <h4>Soil Health Score</h4>
            <div class="progress mb-2" style="height: 30px;">
                <div class="progress-bar bg-${healthColor}" role="progressbar" 
                     style="width: ${result.health_score}%" 
                     aria-valuenow="${result.health_score}" aria-valuemin="0" aria-valuemax="100">
                    ${result.health_score}/100
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <h6>Detected Issues:</h6>
                <ul class="list-unstyled">
                    ${result.issues.map((issue) => `<li><i class="fas fa-exclamation-triangle text-warning me-2"></i>${issue}</li>`).join("")}
                </ul>
            </div>
            <div class="col-md-6">
                <h6>Recommendations:</h6>
                <ul class="list-unstyled">
                    ${result.recommendations.map((rec) => `<li><i class="fas fa-check-circle text-success me-2"></i>${rec}</li>`).join("")}
                </ul>
            </div>
        </div>
        
        <div class="alert alert-info">
            <h6>Suitable Crops for ${result.soil_type} soil:</h6>
            <p class="mb-0">${result.suitable_crops.join(", ")}</p>
        </div>
    `;

  container.innerHTML = html;
  showElement("soilResults");
}

// ============ UTILITY FUNCTIONS ============
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) element.style.display = "block";
}

function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) element.style.display = "none";
}

function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) element.style.display = "block";
}

function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) element.style.display = "none";
}

function showNotification(message, type = "info") {
  if (window.OrganicFarm && window.OrganicFarm.showNotification) {
    window.OrganicFarm.showNotification(message, type);
  }
}
