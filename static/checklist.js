document.addEventListener('DOMContentLoaded', () => {
    const checklistForm = document.getElementById('checklist-form');
    const loanTypeSelect = document.getElementById('loan-type');
    const checklistContainer = document.getElementById('checklist-container');
    const checklistItems = document.getElementById('checklist-items');
    const uploadSection = document.getElementById('upload-section');

    // Generate Checklist
    document.getElementById('generate-checklist').addEventListener('click', async () => {
        const loanType = loanTypeSelect.value;

        // Fetch checklist from API
        const response = await fetch(`/api/checklist?loan_type=${loanType}`);
        if (response.ok) {
            const checklist = await response.json();
            checklistItems.innerHTML = '';
            checklist.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
                checklistItems.appendChild(listItem);
            });

            // Show checklist and upload section
            checklistContainer.style.display = 'block';
            uploadSection.style.display = 'block';
        } else {
            alert('Error fetching checklist. Please try again.');
        }
    });

    // Upload Documents
    document.getElementById('upload-docs').addEventListener('click', async () => {
        const files = document.getElementById('file-upload').files;
        if (files.length === 0) {
            alert('Please select files to upload.');
            return;
        }

        const formData = new FormData();
        for (const file of files) {
            formData.append('documents', file);
        }

        const response = await fetch('/api/upload-documents', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            alert('Documents uploaded successfully!');
        } else {
            alert('Error uploading documents. Please try again.');
        }
    });
});
