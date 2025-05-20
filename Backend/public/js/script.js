document.addEventListener('DOMContentLoaded', function () {
    const radioButtons = document.querySelectorAll('input[name="patient-type"]');
    const newPatientFields = document.getElementById('new-patient-fields');
    const existingPatientFields = document.getElementById('existing-patient-fields');
    const uploadForm = document.getElementById('upload-form');

    radioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === 'new') {
                uploadForm.style.display = "block";
                newPatientFields.style.display = 'block';
                existingPatientFields.style.display = 'none';
            } else if (this.value === 'existing') {
                newPatientFields.style.display = 'none';
                existingPatientFields.style.display = 'block';
                uploadForm.style.display = "block";
            }
        });
    });

    const checkedRadio = document.querySelector('input[name="patient-type"]:checked');
    if (checkedRadio) {
        checkedRadio.dispatchEvent(new Event('change'));
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const timelineBlocks = document.querySelectorAll(".timeline-block");

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target); 
                }
            });
        },
        {
            threshold: 0.1, 
        }
    );

    timelineBlocks.forEach((block) => observer.observe(block));
});
