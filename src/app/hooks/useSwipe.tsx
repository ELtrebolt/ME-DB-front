// https://stackoverflow.com/questions/70612769/how-do-i-recognize-swipe-events-in-react
import {TouchEvent, useState} from "react";

interface SwipeInput {
    onSwipedLeft: () => void
    onSwipedRight: () => void
    disabled?: boolean
}

interface SwipeOutput {
    onTouchStart: (e: TouchEvent) => void
    onTouchMove: (e: TouchEvent) => void
    onTouchEnd: () => void
    onMouseDown: (e: React.MouseEvent) => void
    onMouseMove: (e: React.MouseEvent) => void
    onMouseUp: () => void
}

function Swiper(input: SwipeInput): SwipeOutput {
    const [touchStartX, setTouchStartX] = useState(0)
    const [touchEndX, setTouchEndX] = useState(0)
    const [touchStartY, setTouchStartY] = useState(0)
    const [touchEndY, setTouchEndY] = useState(0)
    const [isTracking, setIsTracking] = useState(false)

    const minSwipeDistance = 100;

    const onTouchStart = (e: TouchEvent) => {
        // Don't start swipe detection on interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button, a, input, select, textarea, .modal, .modal-dialog, .modal-content, .modal-header, .modal-body, .modal-footer, .btn-close')) {
            return;
        }
        
        if (input.disabled) {
            return;
        }
        
        setTouchEndX(0);
        setTouchStartX(e.targetTouches[0].clientX);
        setTouchEndY(0);
        setTouchStartY(e.targetTouches[0].clientY);
        setIsTracking(true);
    }

    const onTouchMove = (e: TouchEvent) => {
        if (!isTracking) return;
        setTouchEndX(e.targetTouches[0].clientX);
        setTouchEndY(e.targetTouches[0].clientY);
    }

    const onTouchEnd = () => {
        if (!isTracking || !touchStartX || !touchEndX || input.disabled) {
            setIsTracking(false);
            return;
        }
        
        const distanceX = touchStartX - touchEndX;
        const distanceY = touchStartY - touchEndY;
        const isLeftSwipe = distanceX > minSwipeDistance;
        const isRightSwipe = distanceX < -minSwipeDistance;

        // Clear coordinates immediately after processing
        setTouchStartX(0);
        setTouchEndX(0);
        setTouchStartY(0);
        setTouchEndY(0);
        setIsTracking(false);

        if (isRightSwipe && Math.abs(distanceX) > distanceY) {
            console.log('Swipe detected: Right');
            input.onSwipedRight();
        } 
        if (isLeftSwipe && distanceX > distanceY) {
            console.log('Swipe detected: Left');
            input.onSwipedLeft();
        }
    }

    // Mouse event handlers for desktop support
    const onMouseDown = (e: React.MouseEvent) => {
        // Don't start swipe detection on interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button, a, input, select, textarea, .modal, .modal-dialog, .modal-content, .modal-header, .modal-body, .modal-footer, .btn-close')) {
            return;
        }
        
        if (input.disabled) {
            return;
        }
        
        setTouchEndX(0);
        setTouchStartX(e.clientX);
        setTouchEndY(0);
        setTouchStartY(e.clientY);
        setIsTracking(true);
    }

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isTracking) return;
        setTouchEndX(e.clientX);
        setTouchEndY(e.clientY);
    }

    const onMouseUp = () => {
        if (!isTracking || !touchStartX || !touchEndX || input.disabled) {
            setIsTracking(false);
            return;
        }
        
        const distanceX = touchStartX - touchEndX;
        const distanceY = touchStartY - touchEndY;
        const isLeftSwipe = distanceX > minSwipeDistance;
        const isRightSwipe = distanceX < -minSwipeDistance;

        // Clear coordinates immediately after processing
        setTouchStartX(0);
        setTouchEndX(0);
        setTouchStartY(0);
        setTouchEndY(0);
        setIsTracking(false);

        if (isRightSwipe && Math.abs(distanceX) > distanceY) {
            console.log('Swipe detected: Right (mouse)');
            input.onSwipedRight();
        } 
        if (isLeftSwipe && distanceX > distanceY) {
            console.log('Swipe detected: Left (mouse)');
            input.onSwipedLeft();
        }
    }

    // Return no-op handlers when disabled to prevent interference with drag and drop
    if (input.disabled) {
        return {
            onTouchStart: () => {},
            onTouchMove: () => {},
            onTouchEnd: () => {},
            onMouseDown: () => {},
            onMouseMove: () => {},
            onMouseUp: () => {}
        }
    }

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        onMouseDown,
        onMouseMove,
        onMouseUp
    }
}

export default Swiper;