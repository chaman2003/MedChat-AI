// Med-Chat Frontend - Neo4j Graph Database + Groq LLM
const API_URL = "http://localhost:3001";

// DOM Elements
const chatForm = document.getElementById("chatForm");
const questionInput = document.getElementById("questionInput");
const chatMessages = document.getElementById("chatMessages");
const roleSelect = document.getElementById("role");
const userIdInput = document.getElementById("userId");
const patientIdSelect = document.getElementById("patientId");
const patientSelectGroup = document.getElementById("patientSelectGroup");
const serverStatus = document.getElementById("serverStatus");
const sendBtn = document.getElementById("sendBtn");

// Role change handler
roleSelect.addEventListener("change", () => {
  const isDoctor = roleSelect.value === "doctor";
  patientSelectGroup.style.display = isDoctor ? "block" : "none";
  
  if (!isDoctor) {
    userIdInput.value = "P001";
    userIdInput.placeholder = "e.g., P001";
  } else {
    userIdInput.value = "D001";
    userIdInput.placeholder = "e.g., D001";
  }
});

// Form submit handler
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const question = questionInput.value.trim();
  if (!question) return;
  
  // Add user message
  addMessage(question, "user");
  questionInput.value = "";
  
  // Show loading
  const loadingId = showLoading();
  sendBtn.disabled = true;
  
  try {
    const response = await sendQuestion(question);
    removeLoading(loadingId);
    
    if (response.success) {
      addMessage(response.answer, "assistant", {
        source: response.source,
        queryType: response.query_type,
        patientId: response.patient_id,
        records: response.records_retrieved
      });
    } else {
      addMessage(response.error, "error");
    }
  } catch (error) {
    removeLoading(loadingId);
    addMessage(`Connection error: ${error.message}`, "error");
  } finally {
    sendBtn.disabled = false;
  }
});

// Send question to API
async function sendQuestion(question) {
  const role = roleSelect.value;
  const userId = userIdInput.value.trim();
  const patientId = role === "doctor" ? patientIdSelect.value : userId;
  
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      role,
      user_id: userId,
      patient_id: patientId
    })
  });
  
  return response.json();
}

// Quick query buttons
function quickQuery(queryType) {
  const patientId = roleSelect.value === "doctor" 
    ? patientIdSelect.value 
    : userIdInput.value.trim();
  
  const queries = {
    diseases: `What diseases does ${patientId} have?`,
    medications: `What medications is ${patientId} currently taking?`,
    symptoms: `What symptoms does ${patientId} have?`,
    lab_results: `Show me ${patientId}'s lab results`,
    allergies: `What allergies does ${patientId} have?`,
    profile: `Show me ${patientId}'s profile information`
  };
  
  questionInput.value = queries[queryType];
  questionInput.focus();
}

// Add message to chat
function addMessage(text, type, meta = null) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;

  let metaHtml = "";
  if (meta && type === "assistant") {
    metaHtml = `
      <div class="message-meta">
        <span>📊 Source: ${meta.source}</span>
        <span>🔍 Query: ${meta.queryType}</span>
        <span>👤 Patient: ${meta.patientId}</span>
        ${meta.records ? `<span>📄 Records: ${meta.records}</span>` : ""}
      </div>
    `;
  }

  // Use LLMParser for assistant messages, simple escape for others
  const content = type === "assistant" 
    ? window.LLMParser.parse(text) 
    : escapeHtml(text);

  messageDiv.innerHTML = `
    <div class="message-content">
      ${content}
      ${metaHtml}
    </div>
  `;

  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

// Show loading indicator
function showLoading() {
  const id = Date.now();
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message assistant";
  loadingDiv.id = `loading-${id}`;
  loadingDiv.innerHTML = `
    <div class="message-content">
      <div class="loading">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  chatMessages.appendChild(loadingDiv);
  scrollToBottom();
  return id;
}

// Remove loading indicator
function removeLoading(id) {
  const loading = document.getElementById(`loading-${id}`);
  if (loading) loading.remove();
}

// Scroll to bottom of chat
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Check server status
async function checkServerStatus() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      serverStatus.classList.add("online");
    } else {
      serverStatus.classList.remove("online");
    }
  } catch {
    serverStatus.classList.remove("online");
  }
}

// Check status on load and periodically
checkServerStatus();
setInterval(checkServerStatus, 10000);
