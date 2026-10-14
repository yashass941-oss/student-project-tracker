const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const message = document.querySelector('#message');

const validStatuses = ['Planned', 'In Progress', 'Completed'];

let projects = [];
let editingId = null;
let dataReady = false;
let loading = false;
let busy = false;

function showMessage(text) {
  message.textContent = text;
}

function resetForm() {
  editingId = null;
  form.reset();

  saveButton.textContent = 'Save Project';
  cancelButton.hidden = true;
}

function renderProjects() {
  projectList.replaceChildren();

  projects.forEach(project => {
    const listItem = document.createElement('li');

    const projectText = document.createElement('span');
    projectText.textContent = `${project.name} — ${project.status} `;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.disabled = busy || loading || !dataReady;

    editButton.addEventListener('click', () => {
      if (busy || loading || !dataReady) return;

      editingId = project.id;
      nameInput.value = project.name;
      statusInput.value = project.status;

      saveButton.textContent = 'Save changes';
      cancelButton.hidden = false;

      showMessage('Editing project.');
      nameInput.focus();
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.disabled = busy || loading || !dataReady;

    deleteButton.addEventListener('click', async () => {
      if (busy || loading || !dataReady) return;

      const confirmed = window.confirm(
        `Delete project "${project.name}"?`
      );

      if (!confirmed) return;

      await deleteProject(project);
    });

    listItem.appendChild(projectText);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);
    projectList.appendChild(listItem);
  });

  emptyState.hidden = !dataReady || projects.length > 0;

  saveButton.disabled = busy || loading || !dataReady;
  cancelButton.disabled = busy || loading;
}

async function getApiError(response) {
  try {
    const data = await response.json();

    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
  } catch {
    // The response did not contain readable JSON.
  }

  return `Request failed with HTTP ${response.status}.`;
}

function validateProjects(data) {
  if (!Array.isArray(data)) {
    throw new Error('The API returned an invalid project list.');
  }

  const seenIds = new Set();
  const uniqueProjects = [];

  for (const project of data) {
    if (
      project === null ||
      typeof project !== 'object' ||
      !Number.isSafeInteger(project.id) ||
      project.id < 1 ||
      typeof project.name !== 'string' ||
      project.name.trim() === '' ||
      !validStatuses.includes(project.status)
    ) {
      throw new Error('The API returned an invalid project record.');
    }

    // Do not display the same server record twice.
    if (seenIds.has(project.id)) continue;

    seenIds.add(project.id);
    uniqueProjects.push({
      id: project.id,
      name: project.name,
      status: project.status
    });
  }

  return uniqueProjects;
}

async function loadProjects({
  loadingMessage = 'Loading projects...',
  successMessage = '',
  failurePrefix = 'Could not load projects.'
} = {}) {
  loading = true;
  showMessage(loadingMessage);
  renderProjects();

  try {
    const response = await fetch('/api/projects');

    if (!response.ok) {
      throw new Error(await getApiError(response));
    }

    const data = await response.json();
    const currentProjects = validateProjects(data);

    projects = currentProjects;
    dataReady = true;

    renderProjects();
    showMessage(successMessage);

    return true;
  } catch (error) {
    dataReady = false;
    renderProjects();

    const detail =
      error instanceof TypeError
        ? 'Network error. Check that the server is running and try again.'
        : error.message;

    showMessage(`${failurePrefix} ${detail}`);

    return false;
  } finally {
    loading = false;
    renderProjects();
  }
}

async function saveProject(event) {
  event.preventDefault();

  if (busy || loading || !dataReady) return;

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (name.length < 1 || name.length > 80) {
    showMessage('Enter a project name between 1 and 80 characters.');
    nameInput.focus();
    return;
  }

  if (!validStatuses.includes(status)) {
    showMessage('Please select a valid project status.');
    statusInput.focus();
    return;
  }

  const isEditing = editingId !== null;
  const idBeingEdited = editingId;

  const url = isEditing
    ? `/api/projects/${encodeURIComponent(idBeingEdited)}`
    : '/api/projects';

  const method = isEditing ? 'PUT' : 'POST';

  const successMessage = isEditing
    ? 'Project updated successfully.'
    : 'Project created successfully.';

  busy = true;
  showMessage(isEditing ? 'Saving changes...' : 'Saving project...');
  renderProjects();

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, status })
    });

    if (!response.ok) {
      showMessage(await getApiError(response));
      return;
    }

    // The server has confirmed the mutation succeeded.
    resetForm();

    await loadProjects({
      loadingMessage: `${successMessage} Refreshing project list...`,
      successMessage,
      failurePrefix:
        `${successMessage} However, the project list could not be refreshed.`
    });
  } catch (error) {
    const detail =
      error instanceof TypeError
        ? 'Network error. Check that the server is running and try again.'
        : error.message;

    showMessage(`Could not save the project. ${detail}`);
  } finally {
    busy = false;
    renderProjects();
  }
}

async function deleteProject(project) {
  busy = true;
  showMessage('Deleting project...');
  renderProjects();

  try {
    const response = await fetch(
      `/api/projects/${encodeURIComponent(project.id)}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      showMessage(await getApiError(response));
      return;
    }

    if (editingId === project.id) {
      resetForm();
    }

    await loadProjects({
      loadingMessage: 'Project deleted. Refreshing project list...',
      successMessage: 'Project deleted successfully.',
      failurePrefix:
        'Project deleted, but the project list could not be refreshed.'
    });
  } catch (error) {
    const detail =
      error instanceof TypeError
        ? 'Network error. Check that the server is running and try again.'
        : error.message;

    showMessage(`Could not delete the project. ${detail}`);
  } finally {
    busy = false;
    renderProjects();
  }
}

// Keep exactly one form-submit listener.
form.addEventListener('submit', saveProject);

cancelButton.addEventListener('click', () => {
  if (busy || loading) return;

  resetForm();
  showMessage('');
  nameInput.focus();
});

// Load projects from the API when the page opens.
loadProjects();