
// Landing Page Specific JavaScript
class LandingPage {
    constructor() {
        this.init();
    }
    
    init() {
        this.initCarousel();
        this.initScrollEffects();
        this.initCategoryHover();
    }
    
    initCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        let currentSlide = 0;
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }
        
        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }
        
        // Auto slide every 5 seconds
        let slideInterval = setInterval(nextSlide, 5000);
        
        // Pause on hover
        const carousel = document.querySelector('.carousel');
        carousel.addEventListener('mouseenter', () => clearInterval(slideInterval));
        carousel.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });
        
        // Button controls
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', prevSlide);
            nextBtn.addEventListener('click', nextSlide);
        }
    }
    
    initScrollEffects() {
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }
    
    initCategoryHover() {
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Other landing page specific methods
    showCategoryProducts(category) {
        // Filter products by category
        window.filterByCategory(category);
        
        // Scroll to products section
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Simple scroll and filter function
function scrollAndFilter(category) {
    // Scroll to products section
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Filter by category
    if (typeof filterByCategory === 'function') {
        filterByCategory(category);
    }
}
// Initialize landing page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const landingPage = new LandingPage();
    
    // Add CSS for navbar scroll effect
    const style = document.createElement('style');
    style.textContent = `
        .navbar-scrolled {
            background: rgba(255, 255, 255, 0.98) !important;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15) !important;
            padding: 0.5rem 0 !important;
        }
        
        .loading {
            min-height: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .spinner-border {
            width: 3rem;
            height: 3rem;
        }
    `;
    document.head.appendChild(style);
    
});