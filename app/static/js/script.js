
    // Basic JavaScript functionality
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM fully loaded');
        
        // Add event listeners to property cards if they exist
        const propertyCards = document.querySelectorAll('.property-card');
        if (propertyCards.length > 0) {
            propertyCards.forEach(card => {
                card.addEventListener('click', function() {
                    const propertyId = this.dataset.propertyId;
                    if (propertyId) {
                        window.location.href = `/properties/${propertyId}`;
                    }
                });
            });
        }
        
        // Handle search form if it exists
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const searchTerm = document.getElementById('search-input').value;
                window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
            });
        }
    });
    