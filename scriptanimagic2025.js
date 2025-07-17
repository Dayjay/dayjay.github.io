class CalendarApp {
    constructor() {
        this.events = [];
        this.currentFilter = 'general';
        this.searchTerm = '';
        this.currentView = 'location';
        this.currentDate = this.getDefaultDate();
        this.favorites = this.loadFavorites();
        this.init();
    }

    getDefaultDate() {
        const today = new Date();
        const currentDateStr = today.toISOString().split('T')[0];
        
        if (currentDateStr === '2025-08-02' || currentDateStr === '2025-08-03') {
            return currentDateStr;
        }
        
        return '2025-08-01';
    }

    async init() {
        await this.loadEvents();
        this.setupEventListeners();
        this.setDefaultDateFilter();
        this.renderEvents();
    }

    setDefaultDateFilter() {
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.value = this.currentDate;
        }
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
            if (this.currentView === 'location') {
                this.renderEvents();
            } else if (this.currentView === 'timeline') {
                this.renderTimelineView();
            } else if (this.currentView === 'favorites') {
                this.renderFavoritesView();
            }
            this.toggleFloatingButtons();
        });

        document.getElementById('clearSearch').addEventListener('click', () => {
            this.clearSearch();
        });

        document.getElementById('clearSearchFloat').addEventListener('click', () => {
            this.clearSearch();
            this.jumpToTop();
        });

        document.getElementById('locationViewBtn').addEventListener('click', () => {
            this.switchView('location');
        });

        document.getElementById('timelineViewBtn').addEventListener('click', () => {
            this.switchView('timeline');
        });

        document.getElementById('favoritesViewBtn').addEventListener('click', () => {
            this.switchView('favorites');
        });

        document.getElementById('dateFilter').addEventListener('change', (e) => {
            this.currentDate = e.target.value;
            this.renderTimelineView();
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

    switchView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (view === 'location') {
            document.getElementById('locationViewBtn').classList.add('active');
            document.querySelector('.location-tabs').style.display = 'flex';
            document.querySelector('.location-dropdown').style.display = 'none';
            document.querySelector('.date-filter-container').style.display = 'none';
            document.querySelector('.calendar-container').style.display = 'block';
            document.querySelector('.timeline-view-container').style.display = 'none';
            this.renderEvents();
        } else if (view === 'timeline') {
            document.getElementById('timelineViewBtn').classList.add('active');
            document.querySelector('.location-tabs').style.display = 'none';
            document.querySelector('.location-dropdown').style.display = 'none';
            document.querySelector('.date-filter-container').style.display = 'flex';
            document.querySelector('.calendar-container').style.display = 'none';
            document.querySelector('.timeline-view-container').style.display = 'block';
            this.renderTimelineView();
        } else if (view === 'favorites') {
            document.getElementById('favoritesViewBtn').classList.add('active');
            document.querySelector('.location-tabs').style.display = 'none';
            document.querySelector('.location-dropdown').style.display = 'none';
            document.querySelector('.date-filter-container').style.display = 'none';
            document.querySelector('.calendar-container').style.display = 'block';
            document.querySelector('.timeline-view-container').style.display = 'none';
            this.renderFavoritesView();
        }
    }

    renderEvents() {
        const eventsLists = document.querySelectorAll('.events-list');
        eventsLists.forEach(list => {
            list.innerHTML = '';
        });

        this.events.forEach(event => {
            const eventDate = event.startDate.split('T')[0];
            const eventsList = document.querySelector(`[data-date="${eventDate}"]`);
            
            if (eventsList && this.shouldShowEvent(event)) {
                const eventElement = this.createEventElement(event);
                eventsList.appendChild(eventElement);
            }
        });
        
        this.updateFavoriteButtons();
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
            <div class="event-buttons">
                <button class="favorite-button" data-event-id="${event.id}" onclick="calendarApp.toggleFavorite(${event.id})" title="Zu Favoriten hinzufügen">🤍</button>
                <button class="copy-button" onclick="calendarApp.copyToCalendar(${event.id})">📅</button>
            </div>
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
        if (this.currentView === 'location') {
            this.renderEvents();
        } else if (this.currentView === 'timeline') {
            this.renderTimelineView();
        } else if (this.currentView === 'favorites') {
            this.renderFavoritesView();
        }
        this.toggleFloatingButtons();
    }

    renderTimelineView() {
        const timelineContent = document.getElementById('timelineContent');
        timelineContent.innerHTML = '';
        
        const locationKeys = ['general', 'mozartsaal', 'musensaal', 'crunchyroll-cinema', 
                             'cinemagic-1', 'cinemagic-2', 'animagic-kino-1', 'animagic-kino-2', 
                             'animagic-kino-3', 'ramen-wok-wok', 'games-area', 'altraverse', 
                             'animehouse', 'animoon', 'blackscreenrecords', 'carlsen', 
                             'crunchyroll', 'dokico', 'leonine', 'peppermint', 'toei'];
        
        let filteredEvents = this.events.filter(event => {
            const eventDate = event.startDate.split('T')[0];
            return eventDate === this.currentDate;
        });
        
        if (this.searchTerm !== '') {
            filteredEvents = filteredEvents.filter(event => 
                event.name.toLowerCase().includes(this.searchTerm));
        }
        
        const timeSlots = this.generateTimeSlots(filteredEvents);
        
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
        
        timeSlots.forEach((timeSlot, index) => {
            if (index > 0 && index % 7 === 0) {
                const headerRow = document.createElement('div');
                headerRow.className = 'timeline-row location-header';
                
                const headerTimeCell = document.createElement('div');
                headerTimeCell.className = 'timeline-time-cell';
                headerTimeCell.textContent = '';
                headerRow.appendChild(headerTimeCell);
                
                locationKeys.forEach(locationKey => {
                    const headerCell = document.createElement('div');
                    headerCell.className = 'timeline-event-cell';
                    headerCell.style.textAlign = 'center';
                    headerCell.style.fontSize = '11px';
                    headerCell.style.fontWeight = 'bold';
                    headerCell.style.color = '#666';
                    headerCell.textContent = locationNames[locationKey];
                    headerRow.appendChild(headerCell);
                });
                
                timelineContent.appendChild(headerRow);
            }
            
            const row = document.createElement('div');
            row.className = 'timeline-row';
            
            const timeCell = document.createElement('div');
            timeCell.className = 'timeline-time-cell';
            timeCell.textContent = timeSlot.time;
            row.appendChild(timeCell);
            
            locationKeys.forEach(locationKey => {
                const cell = document.createElement('div');
                cell.className = 'timeline-event-cell';
                
                const eventsAtTime = timeSlot.events.filter(event => event.location === locationKey);
                eventsAtTime.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.className = `timeline-event location-${event.location}`;
                    
                    const eventName = document.createElement('div');
                    eventName.className = 'timeline-event-name';
                    eventName.textContent = event.name;
                    
                    const eventTime = document.createElement('div');
                    eventTime.className = 'timeline-event-time';
                    eventTime.textContent = `${this.formatTime(event.startDate)} - ${this.formatTime(event.endDate)}`;
                    
                    eventDiv.appendChild(eventName);
                    eventDiv.appendChild(eventTime);
                    
                    eventDiv.title = `${event.name} (${this.formatTime(event.startDate)} - ${this.formatTime(event.endDate)})`;
                    cell.appendChild(eventDiv);
                });
                
                row.appendChild(cell);
            });
            
            timelineContent.appendChild(row);
        });
    }

    generateTimeSlots(events) {
        const timeSlots = new Map();
        
        events.forEach(event => {
            const startTime = new Date(event.startDate);
            const timeKey = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
            
            if (!timeSlots.has(timeKey)) {
                timeSlots.set(timeKey, {
                    time: timeKey,
                    events: []
                });
            }
            
            timeSlots.get(timeKey).events.push(event);
        });
        
        return Array.from(timeSlots.values()).sort((a, b) => a.time.localeCompare(b.time));
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
    }

    renderFavoritesView() {
        const eventsLists = document.querySelectorAll('.events-list');
        eventsLists.forEach(list => {
            list.innerHTML = '';
        });

        const favoriteEvents = this.events.filter(event => this.isFavorite(event.id));
        
        if (favoriteEvents.length === 0) {
            const noFavoritesMessage = document.createElement('div');
            noFavoritesMessage.className = 'no-favorites-message';
            noFavoritesMessage.innerHTML = '<p>Keine Favoriten vorhanden. Klicke auf 🤍 bei Events, um sie als Favoriten zu markieren.</p>';
            document.querySelector('[data-date="2025-08-01"]').appendChild(noFavoritesMessage);
            document.querySelector('[data-date="2025-08-02"]').appendChild(noFavoritesMessage);
            document.querySelector('[data-date="2025-08-03"]').appendChild(noFavoritesMessage);
            return;
        }

        favoriteEvents.forEach(event => {
            const eventDate = event.startDate.split('T')[0];
            const eventsList = document.querySelector(`[data-date="${eventDate}"]`);
            
            if (eventsList && this.shouldShowFavoriteEvent(event)) {
                const eventElement = this.createEventElement(event);
                eventsList.appendChild(eventElement);
            }
        });
        
        this.updateFavoriteButtons();
    }

    shouldShowFavoriteEvent(event) {
        return this.searchTerm === '' || 
               event.name.toLowerCase().includes(this.searchTerm);
    }

    loadFavorites() {
        const stored = localStorage.getItem('animagic-favorites');
        return stored ? JSON.parse(stored) : [];
    }

    saveFavorites() {
        localStorage.setItem('animagic-favorites', JSON.stringify(this.favorites));
    }

    toggleFavorite(eventId) {
        const index = this.favorites.indexOf(eventId);
        if (index === -1) {
            this.favorites.push(eventId);
        } else {
            this.favorites.splice(index, 1);
        }
        this.saveFavorites();
        this.updateFavoriteButtons();
        if (this.currentView === 'favorites') {
            this.renderFavoritesView();
        }
    }

    isFavorite(eventId) {
        return this.favorites.includes(eventId);
    }

    updateFavoriteButtons() {
        document.querySelectorAll('.favorite-button').forEach(button => {
            const eventId = parseInt(button.dataset.eventId);
            button.textContent = this.isFavorite(eventId) ? '❤️' : '🤍';
            button.title = this.isFavorite(eventId) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen';
        });
    }
}

let calendarApp;
document.addEventListener('DOMContentLoaded', () => {
    calendarApp = new CalendarApp();
});