document.addEventListener('DOMContentLoaded', () => {
    
    // --- SCROLL ANIMATIONS ---
    const scrollElements = document.querySelectorAll('.scroll-anim');

    const elementInView = (el, dividend = 1) => {
        const elementTop = el.getBoundingClientRect().top;
        return (elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend);
    };

    const displayScrollElement = (element) => {
        element.classList.add('visible');
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 1.1)) {
                displayScrollElement(el);
            }
        });
    }

    // Initial check on load
    handleScrollAnimation();

    // Check on scroll
    window.addEventListener('scroll', () => {
        handleScrollAnimation();
    });

    // --- FAQ ACCORDION ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // --- SMOOTH SCROLLING FOR ANCHOR LINKS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            // Skip smooth scrolling if the link is meant to open the modal
            if(targetId === '#buy' || this.classList.contains('nav-cta')) return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- MODAL & CHECKOUT LOGIC ---
    const modal = document.getElementById('checkoutModal');
    const closeBtn = document.querySelector('.close-modal');
    const checkoutForm = document.getElementById('checkoutForm');
    
    // Open modal on CTA click
    document.querySelectorAll('a[href="#buy"], .nav-cta').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');

            // CAPI: Track InitiateCheckout when modal opens
            fetch('/api/capi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_name: 'InitiateCheckout',
                    event_url: window.location.href
                })
            }).catch(err => console.error("CAPI error:", err));
        });
    });

    // Close modal
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close modal if clicked outside
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Form Submission & Razorpay Integration
    if(checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;

            // 1. Send Lead Data to Google Sheets
            const googleWebAppUrl = "https://script.google.com/macros/s/AKfycbwMjA6XOIukO5L2OBy9TIAwh5cwqblv8iaC2yUBLskO8tz8kvr5o2Rb0RJ9NyyZ3xgEbg/exec";
            if (googleWebAppUrl !== "YOUR_GOOGLE_SCRIPT_URL_HERE") {
                fetch(googleWebAppUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Prevents CORS issues
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name, email: email, phone: phone })
                }).catch(err => console.error("Error saving lead:", err));
            }

            // Send CAPI Event for Lead Generation when user submits details
            fetch('/api/capi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_name: 'Lead',
                    event_url: window.location.href,
                    user_data: { name: name, email: email, phone: phone }
                })
            }).catch(err => console.error("CAPI error:", err));

            // 2. Razorpay Options
            var options = {
                "key": "rzp_live_SqKJKhltZYuB9N", // Enter the Key ID generated from the Dashboard
                "amount": "99900", // Amount is in currency subunits (paise). ₹999 = 99900.
                "currency": "INR",
                "name": "AutoAdmissions",
                "description": "WhatsApp Admission Template",
                "handler": function (response){
                    // Payment successful
                    console.log("Payment ID: ", response.razorpay_payment_id);
                    // Redirect to Thank You Page
                    window.location.href = "thankyou.html";
                },
                "prefill": {
                    "name": name,
                    "email": email,
                    "contact": phone
                },
                "theme": {
                    "color": "#25D366"
                }
            };

            var rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response){
                alert("Payment Failed. Reason: " + response.error.description);
            });
            
            rzp1.open();
        });
    }

    // --- LAZY LOAD & PLAY VIDEO ON VIEWPORT INTERSECTION ---
    const video = document.getElementById('demoVideo');
    if (video && 'IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Only fetch the video file when the user scrolls near it
                    if (video.getAttribute('preload') === 'none') {
                        video.setAttribute('preload', 'auto');
                    }
                    video.play().catch(err => {
                        console.log("Video autoplay blocked or pending user interaction:", err);
                    });
                } else {
                    // Pause the video when out of viewport to save CPU/battery
                    video.pause();
                }
            });
        }, { threshold: 0.15 });
        videoObserver.observe(video);
    }

});
