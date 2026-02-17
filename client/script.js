// API url
const API_URL = "http://localhost:3000/todos";
let statusTimer;
let firstLoad = true;
let cachedNotes = [];

// Show Status
function showStatus(message, type, duration = 3000) {
  const status = document.getElementById("status");

  if (statusTimer) clearTimeout(statusTimer);

  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = "block";

  statusTimer = setTimeout(() => {
    status.style.display = "none";
  }, duration);
}

// Initialy fetch all data
document.addEventListener("DOMContentLoaded", loadNotes);

// toggleForm call When we add data
function toggleForm() {
  const form = document.getElementById("noteForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

// Initial Load Notes
async function loadNotes() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error();

    const notes = await res.json();
    cachedNotes = notes;

    if (firstLoad) {
      showStatus("Connected to server", "success", 2000);
      firstLoad = false;
    }

    const notesDiv = document.getElementById("notes");
    notesDiv.innerHTML = "";

    notes.forEach(note => {
      notesDiv.innerHTML += `
        <div class="note-card" id="card-${note._id}">
          <div class="note-header">
            <h3 id="title-${note._id}">${note.title}</h3>
            <div class="actions">
              <button onclick="editNote('${note._id}')">Edit</button>
              <button class="delete" onclick="askDelete('${note._id}')">Delete</button>
            </div>
          </div>
          <p id="desc-${note._id}">${note.description}</p>
        </div>
      `;
    });

  } catch {
    showStatus("Backend not connected", "error", 4000);
  }
}

// Add Note
async function addNote() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title || !description){ 
    showStatus("Invalid Data", "error", 4000);
    return;
  }

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description })
    });

    showStatus("Successfully added task", "success", 3000);

    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    toggleForm();
    loadNotes();

  } catch {
    showStatus("Cannot add note", "error", 4000);
  }
}

// Edit Note
function editNote(id) {
  const note = cachedNotes.find(n => n._id === id);
  if (!note) return;

  const card = document.getElementById(`card-${id}`);

  card.innerHTML = `
    <input id="edit-title-${id}" value="${note.title}">
    <textarea id="edit-desc-${id}">${note.description}</textarea>

    <button onclick="updateNote('${id}')">Update</button>
    <button onclick="loadNotes()">Cancel</button>
  `;
}

// Update Notets
async function updateNote(id) {
  const title = document.getElementById(`edit-title-${id}`).value.trim();
  const description = document.getElementById(`edit-desc-${id}`).value.trim();

  if (!title || !description) return;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description })
    });

    showStatus("Successfully updated task", "success", 3000);
    loadNotes();

  } catch {
    showStatus("Update failed", "error", 4000);
  }
}

// Delete Note
function askDelete(id) {
  const card = document.getElementById(`card-${id}`);

  card.innerHTML += `
    <div class="delete-confirm">
      <p>Are you sure you want to delete?</p>
      <button onclick="deleteNote('${id}')">Yes</button>
      <button onclick="loadNotes()">No</button>
    </div>
  `;
}

async function deleteNote(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });

    showStatus("Successfully deleted task", "success", 3000);
    loadNotes();

  } catch {
    showStatus("Delete failed", "error", 4000);
  }
}
