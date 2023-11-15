document.addEventListener('DOMContentLoaded', function () {
    const calendarTable = document.getElementById('calendar');
    const currentMonthYear = document.getElementById('current-month-year');
    const eventList = document.getElementById('event-list');
    const eventInput = document.getElementById('eventInput');
    const eventModal = document.getElementById('eventModal');
    const closeEventModal = document.getElementById('closeEventModal');
    const confirmEvent = document.getElementById('confirmEvent');
    const errorContainer = document.getElementById('error-container');

    const eventData = {
        '2023-11-30': [
            { title: 'Meeting with Team' },
            { title: 'Lunch with Client' }
        ],
        '2023-11-10': [
            { title: 'Webinar: CSS Tips' }
        ],
        '2023-11-15': [
            { title: 'Project Deadline' }
        ],
        '2023-11-25': [
            { title: 'Holiday' },
            { title: 'Family Gathering' }
        ],
        // Add more events as needed
    };

    let selectedDate = null;
    const currentDate = new Date();

    displayLoadingBar();

    selectedDate = currentDate.getDate();

    generateCalendar(currentDate.getFullYear(), currentDate.getMonth() + 1);

    document.getElementById('prev-month').addEventListener('click', function () {
        updateCalendar(-1);
    });

    document.getElementById('next-month').addEventListener('click', function () {
        updateCalendar(1);
    });

    document.getElementById('prev-year').addEventListener('click', function () {
        updateCalendar(-12);
    });

    document.getElementById('next-year').addEventListener('click', function () {
        updateCalendar(12);
    });

    document.getElementById('addEventOP').addEventListener('click', function () {
        openModal('Add Event', 'Confirm');
    });

    document.getElementById('deleteEventOP').addEventListener('click', function () {
        openModal('Delete Event', 'Delete');
    });

    closeEventModal.addEventListener('click', function () {
        closeModal();
    });

    document.querySelector('.modal-header .btn-close').addEventListener('click', function () {
        closeModal();
    });

    confirmEvent.addEventListener('click', function () {
        const eventValue = eventInput.value.trim();
        handleEventConfirmation(eventValue);
    });

    function updateCalendar(monthDiff) {
        currentDate.setMonth(currentDate.getMonth() + monthDiff);
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth() + 1);
    }

    function openModal(title, confirmText) {
        eventInput.value = '';
        document.getElementById('eventModalLabel').textContent = title;
        confirmEvent.textContent = confirmText;
        eventModal.classList.add('show');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        eventModal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }

    function handleError(message) {
        errorContainer.textContent = message;
        errorContainer.classList.add('text-danger');
        errorContainer.style.display = 'block';
    }

    function clearError() {
        errorContainer.textContent = '';
        errorContainer.classList.remove('text-danger');
        errorContainer.style.display = 'none';
    }

    function handleEventConfirmation(eventValue) {
        if (eventValue) {
            if (selectedDate) {
                const dateISO = formatDate(selectedDate);
                const eventExists = eventData[dateISO] && eventData[dateISO].some(event => event.title === eventValue);

                if (document.getElementById('eventModalLabel').textContent === 'Add Event') {
                    addEventToDate(eventValue);
                } else if (document.getElementById('eventModalLabel').textContent === 'Delete Event' && eventExists) {
                    deleteEvent(eventValue);
                } else if (document.getElementById('eventModalLabel').textContent === 'Delete Event' && !eventExists) {
                    handleError(`No such event found on ${dateISO}`);
                    return;
                }
            }

            reloadCalendar();
            closeModal();
        } else {
            handleError('Event not provided');
        }
    }

    function addEventToDate(event) {
        let date = selectedDate;// Fixed date assignment
        const dateISO = formatDate(date);
        let eventObject = { title: event };

        if (eventData[dateISO]) {
            eventData[dateISO].push(eventObject);
        } else {
            eventData[dateISO] = [eventObject];
        }

        const dayCellId = `cell${date.getDate().toString().padStart(2, '0')}`;
        const selectedCell = document.getElementById(dayCellId);

        if (selectedCell) {
            selectedCell.classList.add('event-date');
        }
        reloadCalendar();
    }

    function deleteEvent(eventValue) {
        const dateISO = formatDate(selectedDate);

        if (eventData[dateISO]) {
            eventData[dateISO] = eventData[dateISO].filter(e => e.title !== eventValue);

            if (eventData[dateISO].length === 0) {
                delete eventData[dateISO];
            }
        }
    }

    function generateCalendar(year, month) {
        calendarTable.innerHTML = '';
        eventList.innerHTML = '';
        currentMonthYear.textContent = `${getMonthName(month)} ${year}`;

        const headerRow = calendarTable.insertRow();
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (const day of daysOfWeek) {
            const cell = headerRow.insertCell();
            cell.textContent = day;
        }

        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayIndex = firstDay.getDay();

        let dayCounter = 1;

        for (let i = 0; i < 6; i++) {
            const row = calendarTable.insertRow();

            for (let j = 0; j < 7; j++) {
                const cell = row.insertCell();

                if ((i === 0 && j < startingDayIndex) || dayCounter > daysInMonth) {
                    cell.textContent = '';
                } else {
                    cell.textContent = dayCounter;
                    cell.id = `cell${dayCounter}`;

                    if (j === 0) {
                        cell.classList.add('sunday');
                    }

                    const currentDateISO = formatDate(new Date(year, month - 1, dayCounter));
                    if (eventData[currentDateISO]) {
                        cell.classList.add('event-date');
                    }

                    dayCounter++;
                }

                cell.addEventListener('click', function () {
                    var clickedDay = parseInt(this.textContent, 10);
                    var clickedDaytoDisplay = new Date(year, month - 1, clickedDay);
                    if (this.classList.contains('event-date')) {
                        highlightCell(clickedDay);
                        displayEventsForDay(clickedDaytoDisplay);
                    } else {
                        highlightCell(clickedDay);
                        displayEventsForDay(clickedDaytoDisplay);
                    }
                    selectedDate = new Date(year, month - 1,this.id.trim().slice(4));
                       
                });
            }
        }

        let toCurrentDate = new Date();

        if (toCurrentDate.getMonth() === month - 1 && toCurrentDate.getFullYear() === year) {
            highlightCell(toCurrentDate.getDate());
        }

        hideLoadingBar();
    }

    function reloadCalendar() {
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth() + 1);
        displayEventsForDay(selectedDate);
    }

    function getMonthName(month) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames[month - 1];
    }

    function highlightCell(day) {
        const prevSelectedCell = document.querySelector('.selected-cell');
        if (prevSelectedCell) {
            prevSelectedCell.classList.remove('selected-cell');
        }

        const selectedCell = document.getElementById(`cell${day}`);

        if (selectedCell) {
            selectedCell.classList.add('selected-cell');
        }
    }

    function displayEventsForDay(date) {
        eventList.innerHTML = '';
        const currentDateISO = formatDate(date);
        if (eventData[currentDateISO]) {
            eventData[currentDateISO].forEach(event => {
                const eventItem = document.createElement('li');
                eventItem.textContent = event.title;
                eventList.appendChild(eventItem);
            });
        }
    }

    function formatDate(date) {
        if (!(date instanceof Date)) {
            // If 'date' is not a Date object, create a new Date from it
            date = new Date(date);
        }

        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    function displayLoadingBar() {
        const loadingBar = document.createElement('div');
        loadingBar.id = 'loading-bar';
        loadingBar.textContent = 'Loading...';
        document.body.appendChild(loadingBar);
    }

    function hideLoadingBar() {
        const loadingBar = document.getElementById('loading-bar');
        if (loadingBar) {
            loadingBar.remove();
        }
    }
});
