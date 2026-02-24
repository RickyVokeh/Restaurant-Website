/**
 * UNIVERSAL URL ROUTER - PRODUCTION READY
 * Works on: Localhost, Vercel, Netlify, GitHub Pages, Apache, Nginx
 * No configuration files needed!
 */

(function() {
    'use strict';

    // =========================================
    // 1. SMART ENVIRONMENT DETECTION
    // =========================================
    const Environment = {
        // Detect the correct base path for ANY hosting environment
        getBasePath: function() {
            const path = window.location.pathname;
            const hostname = window.location.hostname;
            
            // =========================================
            // CASE 1: VERCEL DETECTION
            // =========================================
            // Vercel deployments usually have clean URLs at root
            if (window.location.hostname.includes('vercel.app') || 
                document.querySelector('meta[name="vercel"]')) {
                return '/';
            }
            
            // =========================================
            // CASE 2: NETLIFY DETECTION
            // =========================================
            if (window.location.hostname.includes('netlify.app') ||
                document.querySelector('meta[name="netlify"]')) {
                return '/';
            }
            
            // =========================================
            // CASE 3: GITHUB PAGES DETECTION
            // =========================================
            // GitHub Pages user site: username.github.io
            if (hostname.includes('github.io')) {
                // Check if it's a project page (username.github.io/repo/)
                const parts = path.split('/');
                if (parts.length > 2 && parts[1] !== '') {
                    return '/' + parts[1] + '/';
                }
                return '/';
            }
            
            // =========================================
            // CASE 4: LOCAL DEVELOPMENT
            // =========================================
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                // Common local development folders
                const possiblePaths = [
                    '/Meatlovers/',
                    '/meatlovers/',
                ];
                
                // Check each possible path
                for (let basePath of possiblePaths) {
                    if (path.startsWith(basePath)) {
                        return basePath;
                    }
                }
                
                // Auto-detect: if path has more than 2 parts, use the first part
                const parts = path.split('/');
                if (parts.length > 2 && parts[1] !== '') {
                    return '/' + parts[1] + '/';
                }
            }
            
            // =========================================
            // CASE 5: PRODUCTION (CUSTOM DOMAIN)
            // =========================================
            // Check for common production patterns
            if (hostname === 'meatlovers.co.ke' || 
                hostname === 'www.meatlovers.co.ke' ||
                !hostname.includes('localhost')) {
                return '/';
            }
            
            // Default fallback
            return '/';
        },

        // Detect hosting platform (for debugging)
        getPlatform: function() {
            const host = window.location.hostname;
            if (host.includes('vercel.app')) return 'Vercel';
            if (host.includes('netlify.app')) return 'Netlify';
            if (host.includes('github.io')) return 'GitHub Pages';
            if (host === 'localhost' || host === '127.0.0.1') return 'Local';
            if (host === 'meatlovers.co.ke' || host === 'www.meatlovers.co.ke') return 'Production';
            return 'Unknown';
        },

        // Get full context
        getContext: function() {
            return {
                basePath: this.getBasePath(),
                platform: this.getPlatform(),
                hostname: window.location.hostname,
                fullPath: window.location.pathname,
                isLocal: this.getPlatform() === 'Local'
            };
        }
    };

    // =========================================
    // 2. URL CLEANER - Remove .html extension
    // =========================================
    const UrlCleaner = {
        cleanCurrentUrl: function() {
            const path = window.location.pathname;
            
            // Don't redirect if we're on Vercel/Netlify (they handle it)
            const platform = Environment.getPlatform();
            if (platform === 'Vercel' || platform === 'Netlify') {
                return false;
            }
            
            if (path.toLowerCase().endsWith('.html')) {
                const cleanPath = path.slice(0, -5);
                const newUrl = cleanPath + window.location.search + window.location.hash;
                
                if (newUrl !== window.location.pathname) {
                    window.location.replace(newUrl);
                    return true;
                }
            }
            return false;
        }
    };

    // =========================================
    // 3. UNIVERSAL LINK FIXER
    // =========================================
    const LinkFixer = {
        fixAllLinks: function() {
            const context = Environment.getContext();
            const links = document.querySelectorAll('a');
            
            links.forEach(link => {
                const href = link.getAttribute('href');
                
                // Skip external links
                if (!href || 
                    href.startsWith('http') || 
                    href.startsWith('//') ||
                    href.startsWith('#') ||
                    href.startsWith('mailto:') ||
                    href.startsWith('tel:') ||
                    href.startsWith('javascript:')) {
                    return;
                }
                
                // Store original href
                link.setAttribute('data-original-href', href);
                
                // Fix the href based on environment
                let fixedHref = href;
                
                // Remove .html extension if present
                if (fixedHref.endsWith('.html')) {
                    fixedHref = fixedHref.slice(0, -5);
                }
                
                // Handle root-relative paths differently per platform
                if (fixedHref.startsWith('/')) {
                    if (context.platform === 'Local' && context.basePath !== '/') {
                        // Local: /menu -> /Meatlovers/menu
                        fixedHref = context.basePath + fixedHref.slice(1);
                    }
                    // Vercel/Netlify/Production: keep as /menu
                }
                
                // Update the link
                link.setAttribute('href', fixedHref);
                
                // Add click handler for Vercel/Netlify (they handle it natively)
                if (context.platform !== 'Vercel' && context.platform !== 'Netlify') {
                    link.removeEventListener('click', this.handleClick);
                    link.addEventListener('click', this.handleClick);
                }
            });
        },

        handleClick: function(e) {
            const link = this;
            const href = link.getAttribute('href');
            
            if (!href || href.startsWith('http') || href.startsWith('#')) {
                return;
            }
            
            // Let Vercel/Netlify handle it naturally
            const platform = Environment.getPlatform();
            if (platform === 'Vercel' || platform === 'Netlify') {
                return; // Allow default behavior
            }
            
            e.preventDefault();
            window.location.href = href;
        }
    };

    // =========================================
    // 4. VERCEL/NETLIFY OPTIMIZATIONS
    // =========================================
    const PlatformOptimizer = {
        init: function() {
            const platform = Environment.getPlatform();
            
            // Add platform meta tag for debugging
            const meta = document.createElement('meta');
            meta.name = 'platform';
            meta.content = platform;
            document.head.appendChild(meta);
            
            // Vercel-specific optimizations
            if (platform === 'Vercel') {
                // Vercel already handles clean URLs perfectly
                console.log('✅ Vercel detected - using native clean URLs');
            }
            
            // Netlify-specific optimizations
            if (platform === 'Netlify') {
                console.log('✅ Netlify detected - using native clean URLs');
            }
            
            // Local development
            if (platform === 'Local') {
                console.log('📍 Local development - using path:', Environment.getContext().basePath);
            }
            
            // Production
            if (platform === 'Production') {
                console.log('🚀 Production mode - clean URLs enabled');
            }
        }
    };

    // =========================================
    // 5. ACTIVE LINK HIGHLIGHTER
    // =========================================
    const ActiveLink = {
        highlight: function() {
            const currentPath = window.location.pathname;
            const context = Environment.getContext();
            
            document.querySelectorAll('nav a, .nav-menu a, .footer-col a').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || href === '#') return;
                
                link.classList.remove('active');
                
                // Handle root/home page
                if ((href === '/' || href === context.basePath) && 
                    (currentPath === context.basePath || currentPath === context.basePath.slice(0, -1))) {
                    link.classList.add('active');
                }
                // Handle other pages
                else if (href !== '/' && href !== context.basePath && 
                         currentPath.includes(href) && href.length > 1) {
                    link.classList.add('active');
                }
            });
        }
    };

    // =========================================
    // 6. INITIALIZE
    // =========================================
    function init() {
        // Get environment context
        const context = Environment.getContext();
        
        // Log platform info (remove in production)
        console.log(`🌐 Running on: ${context.platform}`);
        console.log(`📁 Base path: ${context.basePath}`);
        
        // Step 1: Clean URLs (if needed)
        UrlCleaner.cleanCurrentUrl();
        
        // Step 2: Platform-specific optimizations
        PlatformOptimizer.init();
        
        // Step 3: Fix all links
        LinkFixer.fixAllLinks();
        
        // Step 4: Highlight active page
        ActiveLink.highlight();
        
        // Step 5: Handle dynamic content
        document.addEventListener('DOMContentLoaded', () => {
            LinkFixer.fixAllLinks();
            ActiveLink.highlight();
        });
        
        // Step 6: Watch for DOM changes
        new MutationObserver(() => {
            LinkFixer.fixAllLinks();
            ActiveLink.highlight();
        }).observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();