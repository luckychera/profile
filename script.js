document.addEventListener('DOMContentLoaded', function() {

    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    
    document.querySelectorAll('.nav-links a').forEach(link => {
    
        link.style.transition = 'all 0.3s ease';
        
        link.onmouseover = () => {
            link.style.textDecoration = 'underline';
            link.style.textUnderlineOffset = '5px';
            link.style.color = '#3b82f6';
        };
        
        link.onmouseout = () => {
            link.style.textDecoration = 'none';
            link.style.color = '';
        };
    });
    
    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
        burger.classList.toggle('active');

        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
    });


    // Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const btn = document.querySelectorAll('.cta-button')[0];
    btn.addEventListener('mouseover', () => {
        btn.style.backgroundColor = '#05265a';
        btn.style.color = '#e69898';
    });
    btn.addEventListener('mouseout', () => {
        btn.style.backgroundColor = '';
        btn.style.color = ''
    });

    const form = document.getElementById('contact-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        console.log('Form submitted:', { name, email, message });

        
        alert('Thank you for your message! I\'ll get back to you soon.');

        
        form.reset();
    });

  // Resisponsiveness using window.matchMedia()  
    function handleResponsiveStyles() {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const isSmallMobile = window.matchMedia('(max-width: 480px)').matches;
        
        // Elements
        const aboutContent = document.querySelector('.about-content');
        const contactContainer = document.querySelector('.contact-container');
        const projectsGrid = document.querySelector('.projects-grid');
        const projectCards = document.querySelectorAll('.project-card');
        const footerContent = document.querySelector('.footer-content');
        const headings = document.querySelectorAll('h1, h2');
        const skillCategories = document.querySelectorAll('.skill-category');
        
        
        if (isMobile) {
            
            if (navLinks) {
                navLinks.style.position = 'fixed';
                navLinks.style.right = '-100%';
                navLinks.style.top = '5rem';
                navLinks.style.flexDirection = 'column';
                navLinks.style.background = 'var(--card)';
                navLinks.style.width = '100%';
                navLinks.style.textAlign = 'center';
                navLinks.style.borderBottom = '1px solid var(--border)';
                navLinks.style.padding = '2rem 0';
            }
            
            
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.style.right = '0';
            }
            
            
            document.querySelectorAll('.nav-links li').forEach(li => {
                li.style.margin = '1.5rem 0';
            });
            
            
            if (burger) burger.style.display = 'block'; 
            
            if (aboutContent) {
                aboutContent.style.flexDirection = 'column';
                aboutContent.style.textAlign = 'center';
            }
            
            
            if (contactContainer) {
                contactContainer.style.flexDirection = 'column';
                contactContainer.style.alignItems = 'center';
            }
            document.querySelectorAll('.contact-container > *').forEach(el => {
                el.style.width = '100%';
            });
            
            
            if (projectsGrid) {
                projectsGrid.style.flexDirection = 'column';
                projectsGrid.style.alignItems = 'center';
            }
            projectCards.forEach(card => {
                card.style.maxWidth = '100%';
                card.style.width = '100%';
            });
            
            
            if (footerContent) {
                footerContent.style.flexDirection = 'column';
                footerContent.style.textAlign = 'center';
            }
        } else {
            // Reset styles for larger screens
            if (navLinks) {
                navLinks.style.position = '';
                navLinks.style.right = '';
                navLinks.style.top = '';
                navLinks.style.flexDirection = '';
                navLinks.style.background = '';
                navLinks.style.width = '';
                navLinks.style.textAlign = '';
                navLinks.style.borderBottom = '';
                navLinks.style.padding = '';
            }
            document.querySelectorAll('.nav-links li').forEach(li => {
                li.style.margin = '';
            });
            if (burger) burger.style.display = '';
            if (aboutContent) {
                aboutContent.style.flexDirection = '';
                aboutContent.style.textAlign = '';
            }
            if (contactContainer) {
                contactContainer.style.flexDirection = '';
                contactContainer.style.alignItems = '';
            }
            document.querySelectorAll('.contact-container > *').forEach(el => {
                el.style.width = '';
            });
            if (projectsGrid) {
                projectsGrid.style.flexDirection = '';
                projectsGrid.style.alignItems = '';
            }
            projectCards.forEach(card => {
                card.style.maxWidth = '';
                card.style.width = '';
            });
            if (footerContent) {
                footerContent.style.flexDirection = '';
                footerContent.style.textAlign = '';
            }
        }
        
        
        if (isSmallMobile) {
            headings.forEach(heading => {
                if (heading.tagName === 'H1') {
                    heading.style.fontSize = '2.5rem';
                } else if (heading.tagName === 'H2') {
                    heading.style.fontSize = '2rem';
                }
            });
            skillCategories.forEach(category => {
                category.style.minWidth = '100%';
            });
        } else {
            headings.forEach(heading => {
                heading.style.fontSize = '';
            });
            skillCategories.forEach(category => {
                category.style.minWidth = '';
            });
        }
    }

    // Initial call
    handleResponsiveStyles();

    // Add event listener for window resize
    window.addEventListener('resize', handleResponsiveStyles);

        const yearSpan = document.getElementById("year");
        const currentYear = new Date().getFullYear();
        yearSpan.textContent = currentYear;

});
