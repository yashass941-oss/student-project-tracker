
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

// Store projects in memory while the page is open.
const projects = [];

// Generate a unique ID for each new project.
function generateId() {
  return crypto.randomUUID();
}

// Display all projects on the page.
function renderProjects() {
  // Clear the old list to prevent duplicate items.
  projectList.replaceChildren();

  // Create and display each project.
  projects.forEach(project => {
    const listItem = document.createElement('li');

    const projectName = document.createElement('span');
    projectName.textContent = project.name;

    const projectStatus = document.createElement('span');
    projectStatus.textContent = ` — ${project.status}`;

    listItem.appendChild(projectName);
    listItem.appendChild(projectStatus);

    projectList.appendChild(listItem);
  });

  // Show or hide the empty-state message.
  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

// Handle form submission.
form.addEventListener('submit', event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  // Reject an empty project name.
  if (name === '') {
    nameInput.value = '';
    nameInput.focus();
    return;
  }

  // Create and store the new project.
  const project = {
    id: generateId(),
    name: name,
    status: status
  };

  projects.push(project);

  // Update the displayed project list.
  renderProjects();

  // Clear the form for the next project.
  form.reset();
});
