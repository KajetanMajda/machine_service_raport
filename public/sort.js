function sortStatusFromSelect() {
    const statusSelect = document.getElementById('order-select');
    const status = statusSelect.value;
    sortStatus(status);
  }
  
  function sortStatus(status) {
    const activeCategory = getActiveCategory();
    if (!activeCategory) {
        console.error('No active category selected');
        return;
    }
  
    const url = `/api/report/category/${encodeURIComponent(activeCategory)}/status/${encodeURIComponent(status)}`;
  
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
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
                setStatusClass(reportStatus, report.status);
  
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
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'img-container';
  
                    const img = document.createElement('img');
                    img.className = 'report-image';
                    img.src = path.startsWith('http') ? path : `/uploads/${path}`;
                    img.alt = 'report picture';
  
                    const hoverButtonContainer = document.createElement('div');
                    hoverButtonContainer.className = 'hover-button-container';
  
                    const hoverButton = document.createElement('button');
                    hoverButton.className = 'hover-button';
                    hoverButton.textContent = 'Usuń';
                    hoverButton.addEventListener('click', () => {
                        if (confirm('Czy napewno chcesz usunąc to zdjęcie?')) {
                            removeImage(report.id, path);
                        }
                    });
  
                    hoverButtonContainer.appendChild(hoverButton);
                    imgContainer.appendChild(img);
                    imgContainer.appendChild(hoverButtonContainer);
                    reportPictures.appendChild(imgContainer);
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