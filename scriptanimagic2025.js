class CalendarApp {
    constructor() {
        this.events = [];
        this.currentFilter = 'mozartsaal';
        this.init();
    }

    async init() {
        await this.loadEvents();
        this.setupEventListeners();
        this.renderEvents();
    }

    async loadEvents() {
        try {
            const response = await fetch('eventsanimagic2025.json');
            this.events = await response.json();
        } catch (error) {
            console.error('Error loading events:', error);
            this.events = [];
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchLocation(e.target.dataset.location);
            });
        });

        document.getElementById('locationSelect').addEventListener('change', (e) => {
            this.switchLocation(e.target.value);
        });
    }

    switchLocation(location) {
        this.currentFilter = location;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-location="${location}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Update dropdown
        document.getElementById('locationSelect').value = location;
        
        this.renderEvents();
    }

    renderEvents() {
        const eventsLists = document.querySelectorAll('.events-list');
        eventsLists.forEach(list => {
            list.innerHTML = '';
        });

        this.events.forEach(event => {
            const eventDate = new Date(event.startDate).toISOString().split('T')[0];
            const eventsList = document.querySelector(`[data-date="${eventDate}"]`);
            
            if (eventsList && this.shouldShowEvent(event)) {
                const eventElement = this.createEventElement(event);
                eventsList.appendChild(eventElement);
            }
        });
    }

    shouldShowEvent(event) {
        return event.location === this.currentFilter;
    }

    createEventElement(event) {
        const eventDiv = document.createElement('div');
        eventDiv.className = `event-item location-${event.location}`;
        
        const startTime = new Date(event.startDate).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
        const endTime = new Date(event.endDate).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });

        const locationNames = {
            'mozartsaal': 'Mozartsaal',
            'museensaal': 'Museensaal',
            'general': 'Allgemein',
            'crunchyroll-cinema': 'Crunchyroll Cinema',
            'cinemagic-1': 'CineMagic 1',
            'cinemagic-2': 'CineMagic 2',
            'animagic-kino-1': 'AnimagiC-Kino 1',
            'animagic-kino-2': 'AnimagiC-Kino 2',
            'animagic-kino-3': 'AnimagiC-Kino 3'
        };

        eventDiv.innerHTML = `
            <div class="event-name">${event.name}</div>
            <div class="event-time">${startTime} - ${endTime}</div>
            <div class="event-location">${locationNames[event.location]}</div>
            ${event.link ? `<a href="${event.link}" class="event-link" target="_blank">More Info</a>` : ''}
            <button class="copy-button" onclick="calendarApp.copyToCalendar(${event.id})">📅</button>
        `;

        return eventDiv;
    }

    copyToCalendar(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        
        const formatDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const locationNames = {
            'mozartsaal': 'Mozartsaal',
            'museensaal': 'Museensaal',
            'general': 'Allgemein',
            'crunchyroll-cinema': 'Crunchyroll Cinema',
            'cinemagic-1': 'CineMagic 1',
            'cinemagic-2': 'CineMagic 2',
            'animagic-kino-1': 'AnimagiC-Kino 1',
            'animagic-kino-2': 'AnimagiC-Kino 2',
            'animagic-kino-3': 'AnimagiC-Kino 3'
        };

        // Create ICS file content
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//AnimagiC//Festival Calendar//EN',
            'BEGIN:VEVENT',
            `UID:${event.id}@animagic2025`,
            `DTSTART:${formatDate(startDate)}`,
            `DTEND:${formatDate(endDate)}`,
            `SUMMARY:${event.name}`,
            `LOCATION:${locationNames[event.location]}`,
            event.link ? `DESCRIPTION:More info: ${event.link}` : 'DESCRIPTION:',
            `DTSTAMP:${formatDate(new Date())}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        // Create and download ICS file
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

let calendarApp;
document.addEventListener('DOMContentLoaded', () => {
    calendarApp = new CalendarApp();
});