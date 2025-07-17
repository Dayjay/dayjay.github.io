class CalendarApp {
    constructor() {
        this.events = [];
        this.currentFilter = 'general';
        this.searchTerm = '';
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

        document.getElementById('jumpToCurrentTime').addEventListener('click', () => {
            this.jumpToCurrentTime();
        });

        document.getElementById('jumpToTop').addEventListener('click', () => {
            this.jumpToTop();
        });

        window.addEventListener('scroll', () => {
            this.toggleFloatingButtons();
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderEvents();
            this.toggleFloatingButtons();
        });

        document.getElementById('clearSearch').addEventListener('click', () => {
            this.clearSearch();
        });

        document.getElementById('clearSearchFloat').addEventListener('click', () => {
            this.clearSearch();
            this.jumpToTop();
        });
    }

    switchLocation(location) {
        this.currentFilter = location;
        
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-location="${location}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
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
        const searchMatch = this.searchTerm === '' || 
                          event.name.toLowerCase().includes(this.searchTerm);
        
        if (this.searchTerm !== '') {
            return searchMatch;
        }
        
        const locationMatch = event.location === this.currentFilter;
        return locationMatch;
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
            'general': 'Allgemein',
            'mozartsaal': 'Mozartsaal',
            'musensaal': 'Musensaal',
            'crunchyroll-cinema': 'Crunchyroll Cinema',
            'cinemagic-1': 'CineMagic 1',
            'cinemagic-2': 'CineMagic 2',
            'animagic-kino-1': 'AnimagiC-Kino 1',
            'animagic-kino-2': 'AnimagiC-Kino 2',
            'animagic-kino-3': 'AnimagiC-Kino 3',
            'ramen-wok-wok': 'Ramen-Wok-Wok-Karaoke',
            'games-area': 'Games-Area',
            'altraverse': 'Altraverse',
            'animehouse': 'Anime House',
            'animoon': 'AniMoon',
            'blackscreenrecords': 'Black Screen Records',
            'carlsen': 'Carlsen Manga',
            'crunchyroll': 'Crunchyroll',
            'dokico': 'Dokico',
            'leonine': 'LEONINE Anime',
            'peppermint': 'peppermint anime',
            'toei': 'Tōei Animation'
        };

        eventDiv.innerHTML = `
            <div class="event-name">${event.name}</div>
            <div class="event-time">${startTime} - ${endTime}</div>
            <div class="event-location">${locationNames[event.location]}</div>
            ${event.link ? `<a href="${event.link}" class="event-link" target="_blank">Mehr Infos</a>` : ''}
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
            'general': 'Allgemein',
            'mozartsaal': 'Mozartsaal',
            'musensaal': 'Museesaal',
            'crunchyroll-cinema': 'Crunchyroll Cinema',
            'cinemagic-1': 'CineMagic 1',
            'cinemagic-2': 'CineMagic 2',
            'animagic-kino-1': 'AnimagiC-Kino 1',
            'animagic-kino-2': 'AnimagiC-Kino 2',
            'animagic-kino-3': 'AnimagiC-Kino 3',
            'ramen-wok-wok': 'Ramen-Wok-Wok-Karaoke',
            'games-area': 'Games-Area',
            'altraverse': 'Altraverse',
            'animehouse': 'Anime House',
            'animoon': 'AniMoon',
            'blackscreenrecords': 'Black Screen Records',
            'carlsen': 'Carlsen Manga',
            'crunchyroll': 'Crunchyroll',
            'dokico': 'Dokico',
            'leonine': 'LEONINE Anime',
            'peppermint': 'peppermint anime',
            'toei': 'Tōei Animation'
        };

        let locationString;
        if (event.location === 'general') {
            locationString = 'Rosengarten Mannheim';
        } else {
            locationString = `Rosengarten Mannheim - ${locationNames[event.location]}`;
        }

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//AnimagiC//Festival Calendar//EN',
            'BEGIN:VEVENT',
            `UID:${event.id}@animagic2025`,
            `DTSTART:${formatDate(startDate)}`,
            `DTEND:${formatDate(endDate)}`,
            `SUMMARY:${event.name} - AnimagiC 2025`,
            `LOCATION:${locationString}`,
            event.link ? `DESCRIPTION:Mehr Infos: ${event.link}` : 'DESCRIPTION:',
            `DTSTAMP:${formatDate(new Date())}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

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
        
        let closestEvent = null;
        let closestTime = Infinity;
        
        this.events.forEach(event => {
            if (event.location === this.currentFilter) {
                const eventStart = new Date(event.startDate);
                const eventHour = eventStart.getHours();
                const eventMinute = eventStart.getMinutes();
                const eventTimeInMinutes = eventHour * 60 + eventMinute;
                const currentTimeInMinutes = currentHour * 60 + currentMinute;
                
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
            this.jumpToTop();
        }
    }

    jumpToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    toggleFloatingButtons() {
        const jumpToTopBtn = document.getElementById('jumpToTop');
        const clearSearchBtn = document.getElementById('clearSearchFloat');
        
        const isScrolled = window.scrollY > 200;
        const hasSearchTerm = this.searchTerm !== '';
        
        if (isScrolled) {
            jumpToTopBtn.style.display = 'flex';
        } else {
            jumpToTopBtn.style.display = 'none';
        }
        
        if (isScrolled && hasSearchTerm) {
            clearSearchBtn.style.display = 'flex';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    }

    clearSearch() {
        this.searchTerm = '';
        document.getElementById('searchInput').value = '';
        this.renderEvents();
        this.toggleFloatingButtons();
    }
}

let calendarApp;
document.addEventListener('DOMContentLoaded', () => {
    calendarApp = new CalendarApp();
});