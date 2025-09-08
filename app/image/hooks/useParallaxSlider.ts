import { useEffect, RefObject } from 'react';

export function useParallaxSlider(sliderRef: RefObject<HTMLDivElement | null>, images: ImageData[]) {
    useEffect(() => {
        if (!sliderRef.current || images.length === 0) return;

        const config = {
            SCROLL_SPEED: 1.75,
            LERP_FACTOR: 0.05,
            MAX_VELOCITY: 200,
        };

        const state = {
            currentX: 0,
            targetX: 0,
            slideWidth: window.innerWidth < 1000 ? 215 : 350, // Match the CSS width
            isDragging: false,
            startX: 0,
            lastX: 0,
            lastMouseX: 0,
            lastScrollTime: Date.now(),
            isMoving: false,
            velocity: 0,
            lastCurrentX: 0,
            dragDistance: 0,
            hasActuallyDragged: false,
            isMobile: window.innerWidth < 1000,
            totalWidth: 0,
            sequenceWidth: 0,
        };

        const track = sliderRef.current.querySelector('.slide-track');
        if (!track) return;
        const slides = Array.from(track.querySelectorAll('.slide'));
        if (slides.length === 0) return;

        const slideMargin = 40; // 20px on each side
        state.sequenceWidth = images.length * (state.slideWidth + slideMargin);
        state.currentX = -state.sequenceWidth / 2;
        state.targetX = state.currentX;
        let isLoopTransitioning = false;

        function updateSlidePositions() {
            if (!track) return;
            if (!state.isDragging && !isLoopTransitioning) {
                if (state.currentX > -state.sequenceWidth * 0.25) {
                    isLoopTransitioning = true;
                    (track as HTMLElement).style.transition = 'none';
                    (track as HTMLElement).style.transform = `translate3d(${state.currentX}px, 0, 0)`;
                    void (track as HTMLElement).offsetWidth;
                    state.currentX -= state.sequenceWidth;
                    state.targetX -= state.sequenceWidth;
                    (track as HTMLElement).style.transform = `translate3d(${state.currentX}px, 0, 0)`;
                    setTimeout(() => { isLoopTransitioning = false; }, 10);
                } else if (state.currentX < -state.sequenceWidth * 1.75) {
                    isLoopTransitioning = true;
                    (track as HTMLElement).style.transition = 'none';
                    (track as HTMLElement).style.transform = `translate3d(${state.currentX}px, 0, 0)`;
                    void (track as HTMLElement).offsetWidth;
                    state.currentX += state.sequenceWidth;
                    state.targetX += state.sequenceWidth;
                    (track as HTMLElement).style.transform = `translate3d(${state.currentX}px, 0, 0)`;
                    setTimeout(() => { isLoopTransitioning = false; }, 10);
                }
            }
            if (!isLoopTransitioning) {
                (track as HTMLElement).style.transition = state.isDragging ? 'none' : 'transform 0.05s linear';
                (track as HTMLElement).style.transform = `translate3d(${state.currentX}px, 0, 0)`;
            }
        }

        function updateParallax() {
            const viewportCenter = window.innerWidth / 2;
            slides.forEach((slide) => {
                const img = slide.querySelector('img');
                if (!img) return;
                const slideRect = slide.getBoundingClientRect();
                if (slideRect.right < -1000 || slideRect.left > window.innerWidth + 1000) return;
                const slideCenter = slideRect.left + slideRect.width / 2;
                const distanceFromCenter = slideCenter - viewportCenter;
                const parallaxOffset = distanceFromCenter * -0.1;
                const distanceRatio = Math.abs(distanceFromCenter) / (window.innerWidth / 2);
                const scale = 1.1 + distanceRatio * 0.1;
                if (state.isDragging || isLoopTransitioning) {
                    img.style.transition = 'none';
                } else {
                    img.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                }
                img.style.transform = `translateX(${parallaxOffset}px) scale(${scale})`;
            });
        }

        function updateMovingState() {
            state.velocity = Math.abs(state.currentX - state.lastCurrentX);
            state.lastCurrentX = state.currentX;
            const isSlowEnough = state.velocity < 0.1;
            const hasBeenStillLongEnough = Date.now() - state.lastScrollTime > 200;
            state.isMoving = state.hasActuallyDragged || !isSlowEnough || !hasBeenStillLongEnough;
            document.documentElement.style.setProperty('--slider-moving', state.isMoving ? '1' : '0');
        }

        function animate() {
            const dynamicLerpFactor = Math.min(
                config.LERP_FACTOR * 1.5,
                Math.max(config.LERP_FACTOR * 0.5, config.LERP_FACTOR / (1 + state.velocity * 0.01))
            );
            state.currentX += (state.targetX - state.currentX) * dynamicLerpFactor;
            updateMovingState();
            updateSlidePositions();
            updateParallax();
            requestAnimationFrame(animate);
        }

        function handleWheel(e: WheelEvent) {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            e.preventDefault();
            state.lastScrollTime = Date.now();
            const scrollDelta = e.deltaY * config.SCROLL_SPEED;
            state.targetX -= Math.max(Math.min(scrollDelta, config.MAX_VELOCITY), -config.MAX_VELOCITY);
        }
        function handleTouchStart(e: TouchEvent) {
            state.isDragging = true;
            state.startX = e.touches[0].clientX;
            state.lastX = state.targetX;
            state.dragDistance = 0;
            state.hasActuallyDragged = false;
            state.lastScrollTime = Date.now();
        }
        function handleTouchMove(e: TouchEvent) {
            if (!state.isDragging) return;
            const deltaX = (e.touches[0].clientX - state.startX) * 1.5;
            state.targetX = state.lastX + deltaX;
            state.dragDistance = Math.abs(deltaX);
            if (state.dragDistance > 5) state.hasActuallyDragged = true;
            state.lastScrollTime = Date.now();
        }
        function handleTouchEnd() {
            state.isDragging = false;
            setTimeout(() => { state.hasActuallyDragged = false; }, 100);
        }
        function handleMouseDown(e: MouseEvent) {
            e.preventDefault();
            state.isDragging = true;
            state.startX = e.clientX;
            state.lastMouseX = e.clientX;
            state.lastX = state.targetX;
            state.dragDistance = 0;
            state.hasActuallyDragged = false;
            state.lastScrollTime = Date.now();
        }
        function handleMouseMove(e: MouseEvent) {
            if (!state.isDragging) return;
            e.preventDefault();
            const deltaX = (e.clientX - state.lastMouseX) * 2;
            state.targetX += deltaX;
            state.lastMouseX = e.clientX;
            state.dragDistance += Math.abs(deltaX);
            if (state.dragDistance > 5) state.hasActuallyDragged = true;
            state.lastScrollTime = Date.now();
        }
        function handleMouseUp() {
            state.isDragging = false;
            setTimeout(() => { state.hasActuallyDragged = false; }, 100);
        }
        function handleResize() {
            state.isMobile = window.innerWidth < 1000;
            state.slideWidth = state.isMobile ? 215 : 350;
            const slideMargin = 40;
            state.sequenceWidth = images.length * (state.slideWidth + slideMargin);
        }

        const slider = sliderRef.current;
        if (!slider) return;
        slider.addEventListener('wheel', handleWheel, { passive: false });
        slider.addEventListener('touchstart', handleTouchStart);
        slider.addEventListener('touchmove', handleTouchMove);
        slider.addEventListener('touchend', handleTouchEnd);
        slider.addEventListener('mousedown', handleMouseDown);
        slider.addEventListener('mouseleave', handleMouseUp);
        slider.addEventListener('dragstart', (e) => e.preventDefault());
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('resize', handleResize);
        animate();
        return () => {
            slider.removeEventListener('wheel', handleWheel);
            slider.removeEventListener('touchstart', handleTouchStart);
            slider.removeEventListener('touchmove', handleTouchMove);
            slider.removeEventListener('touchend', handleTouchEnd);
            slider.removeEventListener('mousedown', handleMouseDown);
            slider.removeEventListener('mouseleave', handleMouseUp);
            slider.removeEventListener('dragstart', (e) => e.preventDefault());
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', handleResize);
        };
    }, [sliderRef, images.length]);
}
