const form = document.getElementById("entryForm");
const resultInput = document.getElementById("result");
const noteInput = document.getElementById("note");
const entryList = document.getElementById("entryList");
const moodButtons = document.querySelectorAll(".mood");

let selectedMood = null;

// Mood selection
moodButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    moodButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedMood = btn.textContent;
  });
});

// Form submit
form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!selectedMood) {
    alert("Please select a mood.");
    return;
  }

  const now = new Date();

  const entry = {
    mood: selectedMood,
    result: isNaN(parseFloat(resultInput.value)) ? "0" : resultInput.value.trim(),
    note: noteInput.value.trim(),
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  saveEntry(entry);
  renderEntries();

  form.reset();
  moodButtons.forEach((b) => b.classList.remove("selected"));
  selectedMood = null;
});

function saveEntry(entry) {
  const entries = JSON.parse(localStorage.getItem("entries") || "[]");
  entries.push(entry);
  localStorage.setItem("entries", JSON.stringify(entries));
}

function deleteEntry(index) {
  const entries = JSON.parse(localStorage.getItem("entries") || "[]");
  entries.splice(index, 1);
  localStorage.setItem("entries", JSON.stringify(entries));
  renderEntries();
}

function editEntry(index) {
  const entries = JSON.parse(localStorage.getItem("entries") || "[]");
  const entry = entries[index];

  selectedMood = entry.mood;
  moodButtons.forEach((btn) => {
    if (btn.textContent === entry.mood) {
      btn.classList.add("selected");
    } else {
      btn.classList.remove("selected");
    }
  });

  resultInput.value = entry.result;
  noteInput.value = entry.note;

  entries.splice(index, 1);
  localStorage.setItem("entries", JSON.stringify(entries));
  renderEntries();
}

function getResultColor(result) {
  const num = parseFloat(result);
  if (isNaN(num)) return 'loss'; // fallback
  return num >= 0 ? 'gain' : 'loss';
}

function renderEntries() {
  const entries = JSON.parse(localStorage.getItem("entries") || "[]");
  entryList.innerHTML = "";

  entries.slice().reverse().forEach((entry, i, arr) => {
    const index = arr.length - 1 - i;
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="entry-card">
        <div class="entry-header">
          <span class="entry-date">${entry.date}</span>
          <span class="entry-time">${entry.time}</span>
        </div>
        <div class="entry-body">
          <div><strong>Mood:</strong> ${entry.mood}</div>
          <div><strong>Result:</strong> <span class="${getResultColor(entry.result)}">${parseFloat(entry.result).toFixed(2)}%</span></div>
          <div><strong>Note:</strong> ${entry.note || "(no note)"}</div>
        </div>
        <div class="entry-buttons">
          <button onclick="editEntry(${index})" title="Edit">✏️ Edit</button>
          <button onclick="deleteEntry(${index})" title="Delete">🗑️ Delete</button>
        </div>
      </div>
    `;
    entryList.appendChild(li);
  });

  drawChart(entries);
}

function drawChart(entries) {
  const canvas = document.getElementById("trendChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const labels = [];
  const data = [];

  entries.forEach((e) => {
    const val = parseFloat(e.result);
    if (!isNaN(val)) {
      labels.push(`${e.date} ${e.time}`);
      data.push(val);
    }
  });

  if (window.trendChart instanceof Chart) {
    window.trendChart.destroy();
  }

  window.trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Profit/Loss (%)',
        data,
        borderColor: '#b8916b',
        backgroundColor: 'rgba(185, 145, 107, 0.2)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (val) => val + '%'
          }
        }
      }
    }
  });
}

// Initial render
renderEntries();
