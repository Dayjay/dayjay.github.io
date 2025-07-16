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

        // Floating buttons
        document.getElementById('jumpToCurrentTime').addEventListener('click', () => {
            this.jumpToCurrentTime();
        });

        document.getElementById('jumpToTop').addEventListener('click', () => {
            this.jumpToTop();
        });

        // Show/hide jump to top button based on scroll position
        window.addEventListener('scroll', () => {
            this.toggleJumpToTopButton();
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

    jumpToCurrentTime() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Find the closest upcoming event
        let closestEvent = null;
        let closestTime = Infinity;
        
        this.events.forEach(event => {
            if (event.location === this.currentFilter) {
                const eventStart = new Date(event.startDate);
                const eventHour = eventStart.getHours();
                const eventMinute = eventStart.getMinutes();
                const eventTimeInMinutes = eventHour * 60 + eventMinute;
                const currentTimeInMinutes = currentHour * 60 + currentMinute;
                
                // Only consider events that haven't started yet today
                if (eventTimeInMinutes >= currentTimeInMinutes) {
                    const timeDiff = eventTimeInMinutes - currentTimeInMinutes;
                    if (timeDiff < closestTime) {
                        closestTime = timeDiff;
                        closestEvent = event;
                    }
                }
            }
        });
        
        if (closestEvent) {
            const eventDate = new Date(closestEvent.startDate).toISOString().split('T')[0];
            const dayElement = document.getElementById(`day-${eventDate}`);
            if (dayElement) {
                dayElement.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // If no upcoming events, scroll to top
            this.jumpToTop();
        }
    }

    jumpToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    toggleJumpToTopButton() {
        const jumpToTopBtn = document.getElementById('jumpToTop');
        if (window.scrollY > 200) {
            jumpToTopBtn.style.display = 'flex';
        } else {
            jumpToTopBtn.style.display = 'none';
        }
    }
}

let calendarApp;
document.addEventListener('DOMContentLoaded', () => {
    calendarApp = new CalendarApp();
});