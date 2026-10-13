const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const message = document.querySelector('#message');

const STORAGE_KEY = 'workshop-projects-v1';
const validStatuses = ['Planned', 'In Progress', 'Completed'];

let projects = [];
let editingId = null;
let storageReady = true;

function showMessage(text) {
  message.textContent = text;
}

function isValidProjects(data) {
  if (!Array.isArray(data)) {
    return false;
  }

  const ids = new Set();

  return data.every(project => {
    if (
      project === null ||
      typeof project !== 'object' ||
      Array.isArray(project) ||
      typeof project.id !== 'string' ||
      project.id.trim() === '' ||
      typeof project.name !== 'string' ||
      project.name.trim() === '' ||
      !validStatuses.includes(project.status) ||
      ids.has(project.id)
    ) {
      return false;
    }

    ids.add(project.id);
    return true;
  });
}

function loadProjects() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (storedData === null) {
      projects = [];
      return;
    }

    const parsedData = JSON.parse(storedData);

    if (!isValidProjects(parsedData)) {
      storageReady = false;
      showMessage(
        'Saved project data is invalid. It has not been overwritten. ' +
        'Please check or remove the stored data before continuing.'
      );
      return;
    }

    projects = parsedData;
  } catch (error) {
    storageReady = false;
    showMessage(
      'Could not read saved projects. Check your browser storage settings. ' +
      'Existing stored data has not been overwritten.'
    );
  }
}

function saveProjects() {
  if (!storageReady) {
    showMessage(
      'Changes could not be saved because the stored project data ' +
      'could not be loaded safely.'
    );
    return false;
  }

  try {
    const serializedProjects = JSON.stringify(projects);
    localStorage.setItem(STORAGE_KEY, serializedProjects);
    showMessage('');
    return true;
  } catch (error) {
    showMessage(
      'Changes could not be saved. Check your browser storage settings ' +
      'or available storage space.'
    );
    return false;
  }
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

    editButton.addEventListener('click', () => {
      editingId = project.id;

      nameInput.value = project.name;
      statusInput.value = project.status;

      saveButton.textContent = 'Save changes';
      cancelButton.hidden = false;

      showMessage('');
      nameInput.focus();
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';

    deleteButton.addEventListener('click', () => {
      const confirmed = window.confirm(
        `Delete project "${project.name}"?`
      );

      if (!confirmed) {
        return;
      }

      const projectIndex = projects.findIndex(
        item => item.id === project.id
      );

      if (projectIndex === -1) {
        return;
      }

      projects.splice(projectIndex, 1);

      if (editingId === project.id) {
        resetForm();
      }

      saveProjects();
      renderProjects();
    });

    listItem.appendChild(projectText);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);
    projectList.appendChild(listItem);
  });

  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

function resetForm() {
  editingId = null;
  form.reset();

  saveButton.textContent = 'Save Project';
  cancelButton.hidden = true;
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (name === '') {
    showMessage('Please enter a project name.');
    nameInput.focus();
    return;
  }

  if (!validStatuses.includes(status)) {
    showMessage('Please select a valid project status.');
    statusInput.focus();
    return;
  }

  if (editingId !== null) {
    const project = projects.find(
      item => item.id === editingId
    );

    if (!project) {
      resetForm();
      renderProjects();
      showMessage('The project being edited could not be found.');
      return;
    }

    project.name = name;
    project.status = status;
  } else {
    const project = {
      id: crypto.randomUUID(),
      name: name,
      status: status
    };

    projects.push(project);
  }

  saveProjects();
  renderProjects();
  resetForm();
  nameInput.focus();
});

cancelButton.addEventListener('click', () => {
  resetForm();
  showMessage('');
  nameInput.focus();
});

loadProjects();
renderProjects();