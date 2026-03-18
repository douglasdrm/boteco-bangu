// Boteco Bangu - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }

    // Initialize Feather Icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Hero Carousel Logic
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000); // 5 seconds interval
    }

    // Navbar Scroll Effect
    const navbar = document.querySelector('nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('bg-red-900/95', 'shadow-lg', 'py-2');
                navbar.classList.remove('bg-transparent', 'py-4');
            } else {
                navbar.classList.remove('bg-red-900/95', 'shadow-lg', 'py-2');
                navbar.classList.add('bg-transparent', 'py-4');
            }
        });
    }

    // Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Cardápio Interaction Logic
    const cardapioButtons = document.querySelectorAll('.cardapio-btn');
    const mainImg = document.getElementById('cardapio-imagem');

    if (cardapioButtons.length > 0 && mainImg) {
        cardapioButtons.forEach(button => {
            button.addEventListener('click', function() {
                const newImg = this.getAttribute('data-img');
                
                // Fade out & slight scale
                mainImg.style.transition = 'all 0.4s ease-in-out';
                mainImg.style.opacity = '0';
                mainImg.style.transform = 'scale(0.98)';
                
                setTimeout(() => {
                    mainImg.src = newImg;
                    // Fade in & back to normal once loaded
                    mainImg.onload = () => {
                        mainImg.style.opacity = '1';
                        mainImg.style.transform = 'scale(1)';
                    };
                }, 400);

                // Update active state
                cardapioButtons.forEach(btn => btn.classList.remove('ativo'));
                this.classList.add('ativo');
            });
        });
    }

    // Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (mobileMenu) mobileMenu.classList.add('hidden');
            }
        });
    });
});
