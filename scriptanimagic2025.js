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
    }

    switchLocation(location) {
        this.currentFilter = location;
        
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-location="${location}"]`).classList.add('active');
        
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
            minute: '2-digit' 
        });
        const endTime = new Date(event.endDate).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const locationNames = {
            'mozartsaal': 'Mozartsaal',
            'museensaal': 'Museensaal',
            'general': 'General',
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
            <button class="copy-button" onclick="calendarApp.copyToCalendar(${event.id})">Copy to Calendar</button>
        `;

        return eventDiv;
    }

    copyToCalendar(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        
        const formatDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0];
        };

        const calendarData = {
            title: event.name,
            start: formatDate(startDate),
            end: formatDate(endDate),
            location: event.location,
            description: event.link ? `More info: ${event.link}` : ''
        };

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarData.title)}&dates=${calendarData.start}/${calendarData.end}&details=${encodeURIComponent(calendarData.description)}&location=${encodeURIComponent(calendarData.location)}`;

        const textToCopy = `${event.name}\n${startDate.toLocaleString()} - ${endDate.toLocaleString()}\nLocation: ${event.location}${event.link ? '\nMore info: ' + event.link : ''}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert('Event copied to clipboard!\n\nYou can also add it to Google Calendar by clicking OK.');
                window.open(googleCalendarUrl, '_blank');
            }).catch(() => {
                window.open(googleCalendarUrl, '_blank');
            });
        } else {
            window.open(googleCalendarUrl, '_blank');
        }
    }
}

let calendarApp;
document.addEventListener('DOMContentLoaded', () => {
    calendarApp = new CalendarApp();
});