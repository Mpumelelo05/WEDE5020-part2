/* =========================================================================
   UBUNTU YOUTH CLUB — MAIN.JS
   Handles:
     1. Sticky header scroll state
     2. Mobile navigation toggle
     3. Image carousel (autoplay, arrows, dots, swipe, counter)
     4. Live date & time in the footer
     5. Contact form validation + success popup
     6. Scroll-reveal animation for sections
   ========================================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* 1. STICKY HEADER ---------------------------------------------------- */
    var header = document.querySelector(".site-header");

    if (header) {
        var onScroll = function () {
            header.classList.toggle("scrolled", window.scrollY > 50);
        };
        window.addEventListener("scroll", onScroll);
        onScroll();
    }

    /* 2. MOBILE NAVIGATION ------------------------------------------------- */
    var navToggle = document.getElementById("navToggle");
    var mainNav = document.getElementById("mainNav");

    if (navToggle && mainNav) {
        navToggle.addEventListener("click", function () {
            var isOpen = mainNav.classList.toggle("open");
            navToggle.classList.toggle("open", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        mainNav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                mainNav.classList.remove("open");
                navToggle.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* 3. CAROUSEL ------------------------------------------------------------
       Slides sit side-by-side and the track is translated horizontally for a
       smooth, GPU-accelerated rotation. Works for any element with class
       "carousel" — supports autoplay, arrow buttons, dot navigation,
       a slide counter, keyboard focus pausing, and touch swipe. */
    function Carousel(root) {
        this.root = root;
        this.track = root.querySelector(".carousel-track");
        this.slides = Array.prototype.slice.call(root.querySelectorAll(".carousel-slide"));
        this.index = 0;
        this.autoplayDelay = parseInt(root.getAttribute("data-autoplay"), 10) || 5000;
        this.timer = null;

        if (!this.track || this.slides.length === 0) return;

        this.buildControls();
        this.goTo(0);
        this.start();
    }

    Carousel.prototype.buildControls = function () {
        var self = this;

        // Dots
        this.dotsWrap = this.root.querySelector(".carousel-dots");
        if (this.dotsWrap) {
            this.slides.forEach(function (_, i) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.setAttribute("aria-label", "Go to slide " + (i + 1));
                dot.addEventListener("click", function () {
                    self.goTo(i);
                    self.restart();
                });
                self.dotsWrap.appendChild(dot);
            });
            this.dots = Array.prototype.slice.call(this.dotsWrap.children);
        }

        this.counter = this.root.querySelector(".carousel-counter");

        var prevBtn = this.root.querySelector(".carousel-btn.prev");
        var nextBtn = this.root.querySelector(".carousel-btn.next");

        if (prevBtn) {
            prevBtn.addEventListener("click", function () {
                self.prev();
                self.restart();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", function () {
                self.next();
                self.restart();
            });
        }

        // Pause on hover / keyboard focus
        this.root.addEventListener("mouseenter", function () { self.stop(); });
        this.root.addEventListener("mouseleave", function () { self.start(); });
        this.root.addEventListener("focusin", function () { self.stop(); });
        this.root.addEventListener("focusout", function () { self.start(); });

        // Touch swipe support
        var startX = 0;
        this.track.addEventListener("touchstart", function (e) {
            startX = e.touches[0].clientX;
            self.stop();
        }, { passive: true });

        this.track.addEventListener("touchend", function (e) {
            var diff = e.changedTouches[0].clientX - startX;
            if (diff > 40) self.prev();
            else if (diff < -40) self.next();
            self.start();
        }, { passive: true });
    };

    Carousel.prototype.goTo = function (i) {
        this.index = (i + this.slides.length) % this.slides.length;
        this.track.style.transform = "translateX(-" + (this.index * 100) + "%)";

        if (this.dots) {
            this.dots.forEach(function (dot, idx) {
                dot.classList.toggle("active", idx === this.index);
            }, this);
        }

        if (this.counter) {
            var current = String(this.index + 1).padStart(2, "0");
            var total = String(this.slides.length).padStart(2, "0");
            this.counter.textContent = current + " / " + total;
        }
    };

    Carousel.prototype.next = function () { this.goTo(this.index + 1); };
    Carousel.prototype.prev = function () { this.goTo(this.index - 1); };

    Carousel.prototype.start = function () {
        if (this.slides.length < 2) return;
        this.stop();
        var self = this;
        this.timer = setInterval(function () { self.next(); }, this.autoplayDelay);
    };

    Carousel.prototype.stop = function () {
        clearInterval(this.timer);
    };

    Carousel.prototype.restart = function () {
        this.start();
    };

    document.querySelectorAll(".carousel").forEach(function (el) {
        new Carousel(el);
    });

    /* 4. LIVE DATE & TIME IN FOOTER ----------------------------------------- */
    function updateFooterClock() {
        var el = document.getElementById("footerDatetime");
        if (!el) return;

        var now = new Date();
        var formatted = now.toLocaleString("en-ZA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });

        el.textContent = formatted;
    }

    updateFooterClock();
    setInterval(updateFooterClock, 1000);

    /* 5. CONTACT FORM VALIDATION -------------------------------------------- */
    var form = document.getElementById("contactForm");

    if (form) {
        var nameInput = document.getElementById("name");
        var emailInput = document.getElementById("email");
        var messageInput = document.getElementById("message");

        var nameError = document.getElementById("nameError");
        var emailError = document.getElementById("emailError");
        var messageError = document.getElementById("messageError");

        var modal = document.getElementById("successModal");
        var closeModalBtn = document.getElementById("closeModal");

        var NAME_PATTERN = /^[A-Za-z\u00C0-\u024F' -]{2,60}$/;
        var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        function setError(input, errorEl, message) {
            errorEl.textContent = message;
            input.classList.toggle("input-error", Boolean(message));
        }

        function validateName() {
            var value = nameInput.value.trim();

            if (!value) {
                setError(nameInput, nameError, "Please enter your full name.");
                return false;
            }
            if (!NAME_PATTERN.test(value)) {
                setError(nameInput, nameError, "Name should be at least 2 letters, with no numbers or symbols.");
                return false;
            }
            setError(nameInput, nameError, "");
            return true;
        }

        function validateEmail() {
            var value = emailInput.value.trim();

            if (!value) {
                setError(emailInput, emailError, "Please enter your email address.");
                return false;
            }
            if (!EMAIL_PATTERN.test(value)) {
                setError(emailInput, emailError, "Please enter a valid email address, e.g. name@example.com.");
                return false;
            }
            setError(emailInput, emailError, "");
            return true;
        }

        function validateMessage() {
            var value = messageInput.value.trim();

            if (!value) {
                setError(messageInput, messageError, "Please enter a message.");
                return false;
            }
            if (value.length < 10) {
                setError(messageInput, messageError, "Your message should be at least 10 characters long.");
                return false;
            }
            setError(messageInput, messageError, "");
            return true;
        }

        var fields = [
            [nameInput, validateName],
            [emailInput, validateEmail],
            [messageInput, validateMessage]
        ];

        fields.forEach(function (pair) {
            var input = pair[0];
            var validator = pair[1];

            input.addEventListener("blur", validator);
            input.addEventListener("input", function () {
                if (input.classList.contains("input-error")) validator();
            });
        });

        function openModal() {
            if (!modal) return;
            modal.classList.add("active");
            modal.setAttribute("aria-hidden", "false");
            if (closeModalBtn) closeModalBtn.focus();
        }

        function closeModal() {
            if (!modal) return;
            modal.classList.remove("active");
            modal.setAttribute("aria-hidden", "true");
        }

        if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
        if (modal) {
            modal.addEventListener("click", function (e) {
                if (e.target === modal) closeModal();
            });
        }
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && modal && modal.classList.contains("active")) closeModal();
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var validName = validateName();
            var validEmail = validateEmail();
            var validMessage = validateMessage();

            if (!validName || !validEmail || !validMessage) {
                form.classList.remove("shake");
                // Force reflow so the animation can replay on repeated invalid submits
                void form.offsetWidth;
                form.classList.add("shake");

                var firstInvalid = form.querySelector(".input-error");
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            // No backend is connected yet — this is where a fetch() call to your
            // server or form service (e.g. Formspree, EmailJS) would go.
            openModal();
            form.reset();
            [nameInput, emailInput, messageInput].forEach(function (input) {
                input.classList.remove("input-error");
            });
        });
    }

    /* 6. SCROLL-REVEAL ANIMATION --------------------------------------------- */
    var revealEls = document.querySelectorAll("main section:not(.hero)");
    revealEls.forEach(function (el) { el.classList.add("reveal"); });

    if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

});