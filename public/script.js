// -----------------------------
// 0. Initialize Map First
// -----------------------------
let map = L.map("map").setView([20.5937, 78.9629], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
}).addTo(map);
let lastMarker, lastCircle;

// ✅ Declare chart instances globally
let barChart;
let damageChart;

// -----------------------------
// 1. Form Submission Handler
// -----------------------------
document.getElementById("claimForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // ✅ Clear previous data
  ["farmerName", "cropType", "latitude", "longitude", "damageType", "growthStage"].forEach(id => {
    document.getElementById(id).textContent = "";
  });

  // ✅ Show loading animation
  document.getElementById("loadingOverlay").style.display = "flex";

  const formData = new FormData(this);

  try {
    const response = await fetch("/submit-claim", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("✅ ML Result:", result);

    if (!result || !result.latitude || !result.damageProbability) {
      throw new Error("Invalid ML response");
    }

    // ✅ Insert user inputs
    document.getElementById("farmerName").textContent = result.farmerName;
    document.getElementById("cropType").textContent = result.cropType;
    document.getElementById("latitude").textContent = result.latitude;
    document.getElementById("longitude").textContent = result.longitude;
    document.getElementById("damageType").textContent = result.damageType ? Object.keys(result.damageType).join(", ") : "N/A";
    document.getElementById("growthStage").textContent = result.growthStageConfirmation?.stage || "N/A";

    // ✅ Unhide visualizations
    document.getElementById("load").style.display = "block";
    setTimeout(() => map.invalidateSize(), 100);
    

    // ✅ Inject visualizations
    updateMap(result.latitude, result.longitude, result.severity, result.affectedArea);
    updateBarChart(result.yieldLoss, result.estimatedPayout, result.recoveryTime);
    updateHeatmap(result.cropHealthIndex, result.soilMoistureAnomaly, result.pestInfestationLikelihood);
    updateDonutChart(result.damageType, result.claimEligibility);
    updateCircularMeters(result.damageProbability, result.modelConfidence, result.pestInfestationLikelihood[0]);

    // ✅ Hide loading animation
    document.getElementById("loadingOverlay").style.display = "none";

  } catch (err) {
    console.error("❌ Error submitting claim:", err);
    document.getElementById("loadingOverlay").style.display = "none";
    alert("❌ Something went wrong. Check console for details.");
  }
});

// -----------------------------
// 2. Map Chart
// -----------------------------
function updateMap(lat, lon, severity, area) {
  map.setView([lat, lon], 12);
  if (lastMarker) map.removeLayer(lastMarker);
  if (lastCircle) map.removeLayer(lastCircle);

  lastMarker = L.marker([lat, lon])
    .addTo(map)
    .bindPopup(
      `<b>Crop Damage Info</b><br>Severity: ${severity}%<br>Area: ${area} ha`
    )
    .openPopup();

  const color = severity < 30 ? "green" : severity < 60 ? "orange" : "red";

  lastCircle = L.circle([lat, lon], {
    radius: area * 120,
    color: color,
    fillColor: color,
    fillOpacity: 0.45,
  }).addTo(map);
}

// -----------------------------
// 3. Bar Chart
// -----------------------------
function updateBarChart(loss, payout, recovery) {
  const ctx = document.getElementById("barChart").getContext("2d");
  if (barChart && typeof barChart.destroy === "function") {
    barChart.destroy();
  }

//   barChart = new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: ["Yield Loss (%)", "Estimated Payout (₹k)", "Recovery (weeks)"],
//       datasets: [
//         {
//           label: "Crop Damage Analysis",
//           data: [loss, payout, recovery],
//           backgroundColor: [
//             "rgba(255, 99, 132, 0.7)",
//             "rgba(54, 162, 235, 0.7)",
//             "rgba(255, 206, 86, 0.7)",
//           ],
//           borderColor: "#444",
//           borderWidth: 1,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       scales: {
//         y: { beginAtZero: true },
//       },
//     },
//   });
// }
barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Yield Loss (%)", "Estimated Payout (₹k)", "Recovery (weeks)"],
      datasets: [
        {
          label: "Crop Damage Analysis",
          data: [loss, payout, recovery],
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
          ],
          borderColor: "#444",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "white", // ✅ legend text color
          },
        },
        tooltip: {
          bodyColor: "white", // ✅ tooltip text color
          titleColor: "white",
        },
      },
      scales: {
        x: {
          ticks: {
            color: "white", // ✅ x-axis labels
          },
        },
        y: {
          ticks: {
            color: "white", // ✅ y-axis labels
          },
        },
      },
    },
  });
}
// -----------------------------
// 4. Heatmap
// -----------------------------
function updateHeatmap(health, moisture, pest) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  for (let i = 0; i < 36; i++) {
    let cell = document.createElement("div");
    cell.className = "cell";

    let h = health[i];
    let color =
      h >= 0.8
        ? "rgb(27, 194, 155)"
        : h >= 0.6
        ? "rgb(42, 228, 82)"
        : h >= 0.4
        ? "rgb(250, 120, 55)"
        : h >= 0.2
        ? "rgb(255, 78, 8)"
        : "rgb(248, 17, 17)";
    cell.style.background = color;

    let m = moisture[i];
    if (m > 0.3) cell.style.border = "3px solid rgb(95, 236, 231)";
    if (m < -0.3) cell.style.border = "3px solid rgb(208, 177, 22)";

    let p = pest[i];
    if (p >= 0.6) cell.style.boxShadow = "inset 0 0 20px rgba(180,29,231,0.7)";
    else if (p >= 0.3)
      cell.style.boxShadow = "inset 0 0 10px rgba(180,29,231,0.4)";

    let tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.innerHTML = `Health: ${h.toFixed(2)}<br>Moisture: ${m.toFixed(
      2
    )}<br>Pest: ${p.toFixed(2)}`;
    cell.appendChild(tooltip);

    cell.onmouseenter = () => (tooltip.style.display = "block");
    cell.onmouseleave = () => (tooltip.style.display = "none");

    grid.appendChild(cell);
  }
}

// -----------------------------
// 5. Donut Chart
// -----------------------------
const evidenceMap = [
  "Top-left crop stress patch",
  "Center soil anomaly zone",
  "Pest hotspot diagonal",
  "Edge dry band",
  "Moisture deficit cluster",
];

function updateDonutChart(damageType, eligibility) {
  const ctx = document.getElementById("damageChart").getContext("2d");

  const labels = Object.keys(damageType);
  const values = Object.values(damageType);

  if (damageChart && typeof damageChart.destroy === "function") {
    damageChart.destroy();
  }

  damageChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Damage Confidence",
          data: values,
        },
      ],
    },
    // options: {
    //   responsive: true,
    //   cutout: "60%",
    //   plugins: {
    //     tooltip: {
    //       callbacks: {
    //         label: function (context) {
    //           let index = context.dataIndex;
    //           let val = context.formattedValue;
    //           return `${context.label}: ${val}% | Evidence: ${
    //             evidenceMap[index % evidenceMap.length]
    //           }`;
    //         },
    //       },
    //     },
    //     legend: { position: "bottom" },
    //   },
     options: {
      responsive: true,
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "white", // ✅ legend text color
          },
        },
        tooltip: {
          bodyColor: "white", // ✅ tooltip body text
          titleColor: "white", // ✅ tooltip title text
        },
      },
      onClick: (evt, element) => {
        if (element.length > 0) {
          const index = element[0].index;
          const damageType = damageChart.data.labels[index];
          alert(`Would highlight heatmap cells for: ${damageType}`);
        }
      },
    },
  });

  document.getElementById("innerLabel").innerText = eligibility;
}

// -----------------------------
// 6. Circular Progress Meters
// -----------------------------
function getSmoothColor(percent) {
  let hue = percent * 1.2;
  return `hsl(${hue}, 90%, 45%)`;
}

function animateRing(element, textElement, targetValue) {
  let current = 0;
  function animate() {
    current += 0.6;
    if (current > targetValue) current = targetValue;
    let degrees = (current / 100) * 360;
    element.style.background = `conic-gradient(${getSmoothColor(
      current
    )} ${degrees}deg, #e6e6e6 ${degrees}deg)`;
    textElement.textContent = Math.round(current) + "%";
    if (current < targetValue) requestAnimationFrame(animate);
  }
  animate();
}

function updateCircularMeters(damage, confidence, pest) {
  animateRing(
    document.getElementById("m1"),
    document.getElementById("t1"),
    damage
  );
  animateRing(
    document.getElementById("m2"),
    document.getElementById("t2"),
    confidence
  );
  animateRing(
    document.getElementById("m3"),
    document.getElementById("t3"),
    pest
  );

  let out = "";
  if (confidence < 60) out = "⚠️ Manual Survey Recommended";
  else if (damage > 50) out = "✅ Likely Eligible for Claim";
  else out = "ℹ️ Monitor field conditions";

  document.getElementById("建议").textContent = out;
}

//  animation

document.addEventListener("DOMContentLoaded", () => {
  const card1 = document.querySelector(".s6item1-4-1");
  const card2 = document.querySelector(".s6item1-4-2");
  const trigger1 = document.querySelector(".s6item1-4-1-5-1");
  const trigger2 = document.querySelector(".s6item1-4-2-1-1");

  // Flip Card 1 → Card 2
  trigger1.addEventListener("click", () => {
    card1.classList.add("flip-ltr");
    setTimeout(() => {
      card1.style.display = "none";
      card1.classList.remove("flip-ltr");
      card2.style.display = "block";
    }, 1200); // match animation duration
  });

  // Flip Card 2 → Card 1
  trigger2.addEventListener("click", () => {
    card2.classList.add("flip-rtl");
    setTimeout(() => {
      card2.style.display = "none";
      card2.classList.remove("flip-rtl");
      card1.style.display = "block";
    }, 1200);
  });
});

// -----------------------------

// document.addEventListener("DOMContentLoaded", () => {
//   const sec1 = document.getElementById("sec-1");

//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         // 1) Blinker animation
//         document.querySelectorAll(".s1item1-6-1, .s1item1-6-2, .s1item1-6-3, .s1item1-6-4")
//           .forEach(el => el.classList.add("blinker-active"));

//         // 2) SlideDown animation
//         document.querySelectorAll(".s1item1-1-1")
//           .forEach(el => el.classList.add("slideDown-active"));

//         // 3) SlideUp animation
//         document.querySelectorAll(".s1item1-2, .s1item1-3, .s1item1-4, .s1item1-5")
//           .forEach(el => el.classList.add("slideUp-active"));

//         // Optional: stop observing after first trigger
//         observer.unobserve(sec1);
//       }
//     });
//   }, { threshold: 0.3 }); // triggers when 30% of sec-1 is visible

//   observer.observe(sec1);
// });

document.addEventListener("DOMContentLoaded", () => {
  const sec1 = document.getElementById("sec-1");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add animation classes
        document.querySelectorAll(".s1item1-6-1, .s1item1-6-2, .s1item1-6-3, .s1item1-6-4")
          .forEach(el => {
            el.classList.remove("blinker-active"); // reset
            void el.offsetWidth; // force reflow
            el.classList.add("blinker-active");
          });

        document.querySelectorAll(".s1item1-1-1")
          .forEach(el => {
            el.classList.remove("slideDown-active");
            void el.offsetWidth;
            el.classList.add("slideDown-active");
          });

        document.querySelectorAll(".s1item1-2, .s1item1-3, .s1item1-4, .s1item1-5")
          .forEach(el => {
            el.classList.remove("slideUp-active");
            void el.offsetWidth;
            el.classList.add("slideUp-active");
          });
      } else {
        // Optional: remove classes when leaving sec-1
        document.querySelectorAll(".blinker-active, .slideDown-active, .slideUp-active")
          .forEach(el => el.classList.remove("blinker-active", "slideDown-active", "slideUp-active"));
      }
    });
  }, { threshold: 0.8 });

  observer.observe(sec1);
});
