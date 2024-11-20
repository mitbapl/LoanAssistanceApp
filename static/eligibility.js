document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eligibility-form');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const eligibilityResult = document.getElementById('eligibility-result');

    // Event listener for the Calculate button
    calculateBtn.addEventListener('click', async () => {
        const income = parseFloat(document.getElementById('income').value) || 0;
        const expenses = parseFloat(document.getElementById('expenses').value) || 0;
        const existingEmis = parseFloat(document.getElementById('existing-emis').value) || 0;
        const rule = document.getElementById('rule').value;

        if (income <= 0 || expenses < 0 || existingEmis < 0) {
            alert('Please enter valid numbers for income, expenses, and EMIs.');
            return;
        }

        try {
            // Send data to the server
            const response = await fetch('/api/eligibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    income,
                    expenses,
                    existing_emis: existingEmis,
                    rule,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                resultContainer.style.display = 'block';
                eligibilityResult.textContent = `Your eligible EMI is approximately ₹${result.max_eligible_emi}`;
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || 'Unable to calculate eligibility'}`);
            }
        } catch (error) {
            alert(`Error connecting to server: ${error.message}`);
        }
    });
});
