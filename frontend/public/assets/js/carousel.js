class Carousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.totalSlides = this.slides.length;
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    init() {
        // Set up event listeners
        document.getElementById('prevBtn').addEventListener('click', () => this.prevSlide());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSlide());
        
        // Set up indicator clicks
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Start autoplay
        this.startAutoPlay();
        
        // Pause autoplay on hover
        const carousel = document.querySelector('.carousel');
        carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        carousel.addEventListener('mouseleave', () => this.startAutoPlay());
        
        // Show first slide
        this.showSlide(0);
    }
    
    // showSlide(index) {
    //     // Hide all slides
    //     this.slides.forEach(slide => {
    //         slide.classList.remove('active');
    //     });
        
    //     // Remove active class from all indicators
    //     this.indicators.forEach(indicator => {
    //         indicator.classList.remove('active');
    //     });
        
    //     // Show current slide and update indicator
    //     this.slides[index].classList.add('active');
    //     this.indicators[index].classList.add('active');
        
    //     this.currentSlide = index;
    // }

    showSlide(index) {
    if (!this.slides.length) {
        console.error("⚠️ No slides found!");
        return;
    }

    // Wrap around the index
    if (index < 0) index = this.slides.length - 1;
    if (index >= this.slides.length) index = 0;

    // Hide all slides
    this.slides.forEach(slide => slide.classList.remove('active'));

    // Remove active from indicators if they exist
    if (this.indicators.length) {
        this.indicators.forEach(indicator => indicator.classList.remove('active'));
    }

    // Show current slide
    const currentSlide = this.slides[index];
    if (currentSlide) currentSlide.classList.add('active');

    // Activate indicator if exists
    if (this.indicators[index]) this.indicators[index].classList.add('active');

    this.currentSlide = index;
}

    
    nextSlide() {
        let nextIndex = this.currentSlide + 1;
        if (nextIndex >= this.totalSlides) {
            nextIndex = 0;
        }
        this.showSlide(nextIndex);
    }
    
    prevSlide() {
        let prevIndex = this.currentSlide - 1;
        if (prevIndex < 0) {
            prevIndex = this.totalSlides - 1;
        }
        this.showSlide(prevIndex);
    }
    
    goToSlide(index) {
        this.showSlide(index);
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Change slide every 5 seconds
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Carousel();
});