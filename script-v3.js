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
            const designation = document.getElementById('designation').value;

            // 1. Send Lead Data to Google Sheets
            const googleWebAppUrl = "https://script.google.com/macros/s/AKfycbxfhT2nTNWlHZogT0-WuVglYO1STBTWYotLf92xBir-tiD4RBk0G8q40CbXVxJ3c1h37A/exec";
            if (googleWebAppUrl !== "YOUR_GOOGLE_SCRIPT_URL_HERE") {
                fetch(googleWebAppUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Prevents CORS issues
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name, email: email, phone: phone, designation: designation })
                }).catch(err => console.error("Error saving lead:", err));
            }

            // Send CAPI Event for Lead Generation when user submits details
            fetch('/api/capi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_name: 'Lead',
                    event_url: window.location.href,
                    user_data: { name: name, email: email, phone: phone, designation: designation }
                })
            }).catch(err => console.error("CAPI error:", err));

            // 2. Razorpay Options
            var options = {
                "key": "rzp_live_SqKJKhltZYuB9N", // Enter the Key ID generated from the Dashboard
                "amount": "39900", // Amount is in currency subunits (paise). ₹399 = 39900.
                "currency": "INR",
                "name": "AutoAdmissions",
                "description": "AutoAdmissions Template",
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

            loadRazorpay(() => {
                var rzp1 = new Razorpay(options);
                rzp1.on('payment.failed', function (response){
                    alert("Payment Failed. Reason: " + response.error.description);
                });
                rzp1.open();
            });
        });
    }

    // --- CLICK TO PLAY DEMO VIDEO ---
    const video = document.getElementById('demoVideo');
    const videoWrapper = document.getElementById('videoWrapper');
    const videoThumbnail = document.getElementById('videoThumbnail');

    if (videoWrapper && videoThumbnail && video) {
        videoWrapper.addEventListener('click', () => {
            if (video.style.display === 'none') {
                videoThumbnail.style.display = 'none';
                video.style.display = 'block';
                video.setAttribute('preload', 'auto');
                video.play().catch(err => {
                    console.log("Video playback blocked or failed:", err);
                });
            }
        });
    }

    // --- STICKY MOBILE CTA SCROLL TRIGGER ---
    const stickyCta = document.getElementById('stickyMobileCta');
    const heroSection = document.querySelector('.hero');

    if (stickyCta && heroSection) {
        window.addEventListener('scroll', () => {
            const heroHeight = heroSection.offsetHeight;
            if (window.scrollY > heroHeight) {
                stickyCta.classList.add('visible');
            } else {
                stickyCta.classList.remove('visible');
            }
        });
    }

    // Initialize/refresh Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// --- LAZY LOAD ANALYTICS & PIXELS ON WINDOW LOAD ---
window.addEventListener('load', () => {
    // Microsoft Clarity
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "wotnjoj5v0");

    // Meta Pixel
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '949207904646111');
    fbq('track', 'PageView');
});

// --- DYNAMIC LAZY LOADER FOR RAZORPAY ---
function loadRazorpay(callback) {
    if (window.Razorpay) {
        callback();
        return;
    }
    const script = document.createElement('script');
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = callback;
    script.onerror = () => alert("Secure payment gateway failed to load. Please check your network connection.");
    document.body.appendChild(script);
}
