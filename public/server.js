function fetchReports(category = null) {
  let url = '/api/reports';
  if (category) {
    url += `?category=${category}`;
  }
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const reportListContainer = document.getElementById('report-list');
      reportListContainer.innerHTML = '';

      data.maintenance.forEach(report => {
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';

        const reportDescription = document.createElement('p');
        reportDescription.className = 'report-description';
        reportDescription.textContent = report.description;

        const reportStartDate = document.createElement('p');
        reportStartDate.className = 'report-date-start';
        reportStartDate.textContent = report.start_date;

        const reportEndDate = document.createElement('p');
        reportEndDate.className = 'report-date-end';
        reportEndDate.textContent = report.end_date;

        const reportComments = document.createElement('p');
        reportComments.className = 'report-comments';
        reportComments.textContent = report.comments;

        const reportStatus = document.createElement('p');
        reportStatus.className = 'report-status';
        reportStatus.textContent = report.status;

        const reportId = document.createElement('p');
        reportId.className = 'report-id';
        reportId.textContent = report.id;
        reportId.style.display = 'none';

        const reportEditButton = document.createElement('button');
        reportEditButton.className = 'report-edit-button';
        reportEditButton.textContent = "Edytuj";

        reportEditButton.addEventListener('click', () => {
          editReport(reportItem, report);
        });

        reportItem.appendChild(reportDescription);
        reportItem.appendChild(reportStartDate);
        reportItem.appendChild(reportEndDate);
        reportItem.appendChild(reportStatus);
        reportItem.appendChild(reportComments);
        reportItem.appendChild(reportEditButton);
        reportItem.appendChild(reportId);

        const reportPictures = document.createElement('div');
        reportPictures.className = 'report-picture-container';

        report.pictures.forEach(path => {
          const img = document.createElement('img');
          img.className = 'report-image';
          img.src = path.startsWith('http') ? path : `/uploads/${path}`;
          img.alt = 'report picture';
          reportPictures.appendChild(img);
        });

        const reportLine = document.createElement('div');
        reportLine.className = 'report-line';
        const hr = document.createElement('hr');
        hr.className = 'last-line';
        reportLine.appendChild(hr);

        reportListContainer.appendChild(reportItem);
        reportListContainer.appendChild(reportPictures);
        reportListContainer.appendChild(reportLine);
      });
    })
    .catch(error => console.error('Error fetching data:', error));
}

function editReport(reportItem, report) {
  reportItem.innerHTML = '';

  const idInput = document.createElement('input');
  idInput.type = 'hidden';
  idInput.id = 'report-id';
  idInput.value = report.id;

  const descriptionInput = document.createElement('textarea');
  descriptionInput.id = 'description';
  descriptionInput.name = 'description';
  descriptionInput.placeholder = 'Opis problemu';
  descriptionInput.value = report.description;

  const startDateLabel = document.createElement('label');
  startDateLabel.htmlFor = 'start_date';
  startDateLabel.className = 'startDate';
  startDateLabel.textContent = 'Data wystąpienia';

  const startDateInput = document.createElement('input');
  startDateInput.id = 'start_date';
  startDateInput.className = 'startDate';
  startDateInput.type = 'date';
  startDateInput.name = 'start_date';
  const today = new Date().toISOString().split('T')[0];
  startDateInput.value = today;

  const endDateLabel = document.createElement('label');
  endDateLabel.htmlFor = 'end_date';
  endDateLabel.className = 'endDate';
  endDateLabel.textContent = 'Data naprawy';

  const endDateInput = document.createElement('input');
  endDateInput.id = 'end_date';
  endDateInput.className = 'endDate';
  endDateInput.type = 'date';
  endDateInput.name = 'end_date';
  endDateInput.placeholder = 'Data naprawy';
  endDateInput.value = report.end_date;

  startDateInput.addEventListener('change', () => {
    endDateInput.min = startDateInput.value;
  });

  const statusSelect = document.createElement('select');
  statusSelect.className = 'selection-status';
  statusSelect.name = 'status';
  const statusOptions = [
    { value: 'selection', text: 'Status', disabled: true, selected: true },
    { value: 'Zrobione', text: 'Zrobione' },
    { value: 'W trakcie', text: 'W trakcie' },
    { value: 'Do zrobienia', text: 'Do zrobienia' }
  ];

  statusOptions.forEach(optionData => {
    const option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.disabled) option.disabled = true;
    if (optionData.selected) option.selected = true;
    statusSelect.appendChild(option);
  });

  statusSelect.value = report.status || 'selection';

  const commentsInput = document.createElement('textarea');
  commentsInput.id = 'comments';
  commentsInput.name = 'comments';
  commentsInput.placeholder = 'Uwagi';
  commentsInput.value = report.comments;

  const picturesInput = document.createElement('input');
  picturesInput.id = 'pictures';
  picturesInput.name = 'pictures';
  picturesInput.type = 'file';
  picturesInput.placeholder = 'Załącz zdjęcia';
  picturesInput.multiple = true;

  const buttonEditContainer = document.createElement('div');
  buttonEditContainer.className = 'button-edit-container';

  const saveButton = document.createElement('button');
  saveButton.className = 'confirmButton';
  saveButton.textContent = 'Zatwierdz';
  saveButton.addEventListener('click', (e) => {
    e.preventDefault();
    saveReport(idInput.value, descriptionInput.value, startDateInput.value, endDateInput.value, statusSelect.value, commentsInput.value);
  });

  const cancelButton = document.createElement('button');
  cancelButton.className = 'backButton';
  cancelButton.textContent = 'Cofnij';
  cancelButton.addEventListener('click', () => {
    fetchReports();
  });

  const deleteButton = document.createElement('button');
  deleteButton.className = 'deleteButton';
  deleteButton.textContent = 'Usuń';
  deleteButton.addEventListener('click', () => {
    deleteReport(idInput.value);
  });

  buttonEditContainer.appendChild(saveButton);
  buttonEditContainer.appendChild(cancelButton);
  buttonEditContainer.appendChild(deleteButton);

  reportItem.appendChild(idInput);
  reportItem.appendChild(descriptionInput);
  reportItem.appendChild(startDateLabel);
  reportItem.appendChild(startDateInput);
  reportItem.appendChild(endDateLabel);
  reportItem.appendChild(endDateInput);
  reportItem.appendChild(statusSelect);
  reportItem.appendChild(commentsInput);
  reportItem.appendChild(picturesInput);
  reportItem.appendChild(buttonEditContainer);
}

function saveReport(id, description, startDate, endDate, status, comments) {
  const data = {
    id: id,
    description: description,
    start_date: startDate,
    end_date: endDate,
    status: status,
    comments: comments
  };

  fetch(`/api/reports/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(() => {
      fetchReports();
    })
    .catch(error => console.error('Error saving data:', error));
}

function deleteReport(id) {
  fetch(`/api/reports/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      fetchReports();
    })
    .catch(error => console.error('Error deleting data:', error));
}

function filterReports(category) {
  fetchReports(category);
  toggleForm(category !== null);
}

function getActiveCategory() {
  const activeElement = document.querySelector('.navbarItem.active');
  return activeElement ? activeElement.textContent : null;
}

function navUnderScore(event) {
  document.querySelectorAll('.navbarItem').forEach(item => item.classList.remove('active'));
  event.target.classList.add('active');
}

function toggleForm(show) {
  const formContainer = document.getElementById('add-container');
  formContainer.style.display = show ? 'block' : 'none';
}

document.getElementById('report-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const activeCategory = getActiveCategory();
  document.getElementById('category').value = activeCategory;

  const formData = new FormData(this);

  const data = {
    description: formData.get('description'),
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date'),
    status: formData.get('status'),
    comments: formData.get('comments'),
    category: formData.get('category'),
    pictures: formData.getAll('pictures')
  };

  const submitData = new FormData();
  submitData.append('description', data.description);
  submitData.append('start_date', data.start_date);
  submitData.append('end_date', data.end_date);
  submitData.append('status', data.status);
  submitData.append('comments', data.comments);
  submitData.append('category', data.category);
  data.pictures.forEach((picture, index) => {
    submitData.append('pictures', picture);
  });

  fetch('/api/reports', {
    method: 'POST',
    body: submitData
  })
    .then(response => response.json())
    .then(() => {
      this.reset();
      fetchReports();
    })
    .catch(error => console.error('Error:', error));
});

fetchReports();
toggleForm(false);
