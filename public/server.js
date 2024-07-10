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

        const reportEditButton = document.createElement('button');
        reportEditButton.className = 'report-edit-button';
        reportEditButton.textContent = "Edytuj";

        reportItem.appendChild(reportDescription);
        reportItem.appendChild(reportStartDate);
        reportItem.appendChild(reportEndDate);
        reportItem.appendChild(reportComments);
        reportItem.appendChild(reportEditButton);

        const reportPictures = document.createElement('div');
        reportPictures.className = 'report-picture-container';

        report.pictures.forEach(path => {
          const img = document.createElement('img');
          img.className = 'report-image';
          img.src = `/uploads/${path}`;
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

function filterReports(category) {
  fetchReports(category);
}

document.getElementById('report-form').addEventListener('submit', function (event) {
  event.preventDefault();
  const formData = new FormData(this);

  fetch('/api/reports', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(() => {
      this.reset();
      fetchReports();
    })
    .catch(error => console.error('Error:', error));
});

fetchReports();
