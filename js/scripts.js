/*!
* Start Bootstrap - Resume v7.0.3 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // ============================================================
    // Google Analytics Section Tracking
    // ============================================================

    // Navigation Click Tracking
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const destination = href.substring(1);
                if (window.trackEvent) {
                    window.trackEvent('navigation_click', {
                        'destination_section': destination,
                        'link_text': this.textContent.trim()
                    });
                }
            }
        });
    });

    // Outbound Link Click Tracking
    const trackedLinks = document.querySelectorAll('[data-ga-link-type]');
    trackedLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const linkType = this.getAttribute('data-ga-link-type');
            const destination = this.getAttribute('data-ga-destination') || new URL(this.href).hostname;
            const linkText = this.textContent.trim();

            if (window.trackEvent) {
                window.trackEvent('outbound_link_click', {
                    'link_type': linkType,
                    'destination_domain': destination,
                    'link_text': linkText
                });
            }
        });
    });

    // Section View Tracking with Intersection Observer
    const sectionEngagementTimes = {};
    const sectionViewTracking = new Map();

    const trackSectionView = (sectionName, scrollDepth) => {
        if (window.trackEvent) {
            window.trackEvent('section_view', {
                'section_name': sectionName,
                'scroll_depth': scrollDepth
            });
        }
    };

    const trackSectionEngagement = (sectionName, timeSeconds) => {
        if (window.trackEvent && timeSeconds > 0) {
            window.trackEvent('section_engagement', {
                'section_name': sectionName,
                'time_seconds': Math.round(timeSeconds)
            });
        }
    };

    // Create Intersection Observer for section tracking
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: [0.25, 0.5, 0.75, 1.0]
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const sectionId = entry.target.id;
            if (!sectionId) return;

            // Determine scroll depth based on threshold
            let scrollDepth = 0;
            if (entry.intersectionRatio >= 0.25) scrollDepth = 25;
            if (entry.intersectionRatio >= 0.5) scrollDepth = 50;
            if (entry.intersectionRatio >= 0.75) scrollDepth = 75;
            if (entry.intersectionRatio >= 1.0) scrollDepth = 100;

            // Track section view at this depth (avoid duplicate events)
            const trackingKey = `${sectionId}_${scrollDepth}`;
            if (!sectionViewTracking.has(trackingKey) && entry.isIntersecting) {
                sectionViewTracking.set(trackingKey, true);
                trackSectionView(sectionId, scrollDepth);
            }

            // Track section engagement timing
            if (entry.isIntersecting) {
                // Section entered viewport
                sectionEngagementTimes[sectionId] = Date.now();
            } else if (sectionEngagementTimes[sectionId]) {
                // Section left viewport
                const timeSpent = (Date.now() - sectionEngagementTimes[sectionId]) / 1000;
                trackSectionEngagement(sectionId, timeSpent);
                delete sectionEngagementTimes[sectionId];
            }
        });
    }, observerOptions);

    // Observe all resume sections
    const sections = document.querySelectorAll('.resume-section');
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Finalize section engagement on page unload
    window.addEventListener('beforeunload', () => {
        Object.keys(sectionEngagementTimes).forEach(sectionId => {
            const timeSpent = (Date.now() - sectionEngagementTimes[sectionId]) / 1000;
            trackSectionEngagement(sectionId, timeSpent);
        });
    });

});
