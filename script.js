/* =========================================================
   Age Calculator — script.js
   CodeAlpha Internship Project
   =========================================================

   Key Concepts Covered:
   ✅ DOM Manipulation
   ✅ JavaScript Date & Time
   ✅ Input Validation
   ✅ Dynamic UI updates
   ✅ Accessible ARIA live regions

   ========================================================= */

/* ── Populate dropdowns on page load ──────────────────────── */
(function initDropdowns() {
  const daySelect  = document.getElementById('sel-day');
  const yearSelect = document.getElementById('sel-year');
  const currentYear = new Date().getFullYear();

  // Fill days 1–31
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    daySelect.appendChild(opt);
  }

  // Fill years: current year → 1900
  for (let y = currentYear; y >= 1900; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
})();

/* ── Helpers ─────────────────────────────────────────────── */

/**
 * Show an error message and hide results.
 * @param {string} message - Human-readable error text.
 */
function showError(message) {
  const box  = document.getElementById('error-box');
  const text = document.getElementById('error-text');

  text.textContent = message;
  box.removeAttribute('hidden');          // show error
  document.getElementById('result-section').setAttribute('hidden', ''); // hide result
}

/** Clear the error box. */
function clearError() {
  const box = document.getElementById('error-box');
  box.setAttribute('hidden', '');
}

/**
 * Format a large number with commas.
 * e.g.  12345 → "12,345"
 * @param {number} num
 * @returns {string}
 */
function fmt(num) {
  return num.toLocaleString('en-IN'); // Indian locale for commas
}

/**
 * Get the number of days in a specific month of a given year.
 * Accounts for leap years automatically via Date wrapping.
 * @param {number} year
 * @param {number} month  - 0-indexed (0=Jan, 11=Dec)
 * @returns {number}
 */
function daysInMonth(year, month) {
  // Day 0 of next month = last day of current month
  return new Date(year, month + 1, 0).getDate();
}

/* ── Core calculation ─────────────────────────────────────── */

/**
 * Main function: reads dropdowns, validates, calculates age,
 * and renders the results section.
 */
function calculateAge() {
  clearError();

  // ── 1. Read values ──────────────────────────────────────
  const dayVal   = document.getElementById('sel-day').value;
  const monthVal = document.getElementById('sel-month').value;
  const yearVal  = document.getElementById('sel-year').value;

  // ── 2. Validate: all fields must be selected ────────────
  if (!dayVal || monthVal === '' || !yearVal) {
    showError('Please select a complete date of birth — day, month, and year.');
    return;
  }

  const day   = parseInt(dayVal,   10);
  const month = parseInt(monthVal, 10);  // 0-indexed
  const year  = parseInt(yearVal,  10);

  // ── 3. Validate: day must exist in that month/year ──────
  // e.g. Feb 30 or Sep 31 are invalid
  const maxDay = daysInMonth(year, month);
  if (day > maxDay) {
    const monthNames = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
    showError(`${monthNames[month]} ${year} only has ${maxDay} days. Please pick a valid day.`);
    return;
  }

  // ── 4. Build Date objects ────────────────────────────────
  const birthDate = new Date(year, month, day);
  const today     = new Date();
  today.setHours(0, 0, 0, 0);  // strip time component

  // ── 5. Validate: not in the future ──────────────────────
  if (birthDate > today) {
    showError('Date of birth cannot be in the future. Please check the year.');
    return;
  }

  // ── 6. Calculate years, months, days ────────────────────
  let years  = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth()    - birthDate.getMonth();
  let days   = today.getDate()     - birthDate.getDate();

  // Borrow days from the previous month if needed
  if (days < 0) {
    months--;
    // How many days were in the month BEFORE today's month?
    days += daysInMonth(today.getFullYear(), today.getMonth() - 1);
  }

  // Borrow 12 months from the previous year if needed
  if (months < 0) {
    years--;
    months += 12;
  }

  // ── 7. Calculate total totals ────────────────────────────
  const diffMs      = today - birthDate;           // milliseconds since birth
  const totalDays   = Math.floor(diffMs / 86400000);
  const totalMonths = years * 12 + months;
  const totalHours  = totalDays * 24;
  const totalMins   = totalHours * 60;

  // ── 8. Calculate next birthday ───────────────────────────
  let nextBday = new Date(today.getFullYear(), month, day);
  if (nextBday <= today) {
    nextBday = new Date(today.getFullYear() + 1, month, day);
  }
  const daysToNextBday = Math.round((nextBday - today) / 86400000);

  // ── 9. Render results ────────────────────────────────────
  renderResults({
    years, months, days,
    totalMonths, totalDays, totalHours, totalMins,
    daysToNextBday, nextBday
  });
}

/* ── Render function ─────────────────────────────────────── */

/**
 * Fills in the results section and reveals it.
 * @param {Object} data - Calculated values
 */
function renderResults(data) {
  const {
    years, months, days,
    totalMonths, totalDays, totalHours, totalMins,
    daysToNextBday, nextBday
  } = data;

  // Big 3 numbers
  document.getElementById('r-years').textContent  = years;
  document.getElementById('r-months').textContent = months;
  document.getElementById('r-days').textContent   = days;

  // Totals row
  document.getElementById('t-months').textContent = fmt(totalMonths);
  document.getElementById('t-days').textContent   = fmt(totalDays);
  document.getElementById('t-hours').textContent  = fmt(totalHours);
  document.getElementById('t-mins').textContent   = fmt(totalMins);

  // Birthday countdown
  const bdayEmoji = document.getElementById('bday-emoji');
  const bdayTitle = document.getElementById('bday-title');
  const bdaySub   = document.getElementById('bday-sub');

  if (daysToNextBday === 0) {
    bdayEmoji.textContent = '🥳';
    bdayTitle.textContent = 'Happy Birthday to you!';
    bdaySub.textContent   = 'Today is your special day — celebrate! 🎉';
  } else if (daysToNextBday === 1) {
    bdayEmoji.textContent = '🎁';
    bdayTitle.textContent = 'Tomorrow is your birthday!';
    bdaySub.textContent   = 'Get ready for the cake! 🎂';
  } else {
    bdayEmoji.textContent = '🎂';
    bdayTitle.textContent = `Next birthday in ${daysToNextBday} days`;
    const formatted = nextBday.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    bdaySub.textContent = `On ${formatted}`;
  }

  // Confetti emojis  🎉
  buildConfetti();

  // Show result section, hide form section's button area  
  document.getElementById('result-section').removeAttribute('hidden');

  // Scroll result into view on mobile
  document.getElementById('result-section').scrollIntoView({
    behavior: 'smooth', block: 'nearest'
  });
}

/* ── Confetti builder ─────────────────────────────────────── */

/** Fills the confetti row with random celebration emojis. */
function buildConfetti() {
  const confettiEmojis = ['🎉','✨','🎊','💜','🌟','🥳','🎈','💫','🎁','🎀'];
  const row = document.getElementById('confetti-row');
  row.innerHTML = '';

  const count = 9;
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.textContent = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
    row.appendChild(span);
  }
}

/* ── Reset function ───────────────────────────────────────── */

/**
 * Resets the calculator to its initial state:
 * - Clears all dropdowns back to placeholder
 * - Hides results and errors
 */
function resetCalc() {
  // Reset dropdowns
  document.getElementById('sel-day').value   = '';
  document.getElementById('sel-month').value = '';
  document.getElementById('sel-year').value  = '';

  // Hide results & error
  document.getElementById('result-section').setAttribute('hidden', '');
  clearError();

  // Scroll back to top of card
  document.querySelector('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Keyboard shortcut ────────────────────────────────────── */
// Press Enter anywhere on the page to calculate
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    calculateAge();
  }
});