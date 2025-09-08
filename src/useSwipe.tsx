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

    const minSwipeDistance = 100;

    const onTouchStart = (e: TouchEvent) => {
        setTouchEndX(0);
        setTouchStartX(e.targetTouches[0].clientX)

        setTouchEndY(0)
        setTouchStartY(e.targetTouches[0].clientY)
    }

    const onTouchMove = (e: TouchEvent) => {
        setTouchEndX(e.targetTouches[0].clientX)
        setTouchEndY(e.targetTouches[0].clientY)
    }

    const onTouchEnd = () => {
        if (!touchStartX || !touchEndX || input.disabled) return;
        const distanceX = touchStartX - touchEndX
        const distanceY = touchStartY - touchEndY
        const isLeftSwipe = distanceX > minSwipeDistance
        const isRightSwipe = distanceX < -minSwipeDistance

        console.log('Touch swipe detection:', { touchStartX, touchEndX, distanceX, distanceY, isLeftSwipe, isRightSwipe, disabled: input.disabled });

        if (isRightSwipe && Math.abs(distanceX) > distanceY) {
            console.log('Right touch swipe detected');
            input.onSwipedRight();
        } 
        if (isLeftSwipe && distanceX > distanceY) {
            console.log('Left touch swipe detected');
            input.onSwipedLeft();
        }
    }

    // Mouse event handlers for desktop support
    const onMouseDown = (e: React.MouseEvent) => {
        setTouchEndX(0);
        setTouchStartX(e.clientX)
        setTouchEndY(0)
        setTouchStartY(e.clientY)
    }

    const onMouseMove = (e: React.MouseEvent) => {
        setTouchEndX(e.clientX)
        setTouchEndY(e.clientY)
    }

    const onMouseUp = () => {
        if (!touchStartX || !touchEndX || input.disabled) return;
        const distanceX = touchStartX - touchEndX
        const distanceY = touchStartY - touchEndY
        const isLeftSwipe = distanceX > minSwipeDistance
        const isRightSwipe = distanceX < -minSwipeDistance

        console.log('Mouse swipe detection:', { touchStartX, touchEndX, distanceX, distanceY, isLeftSwipe, isRightSwipe, disabled: input.disabled });

        if (isRightSwipe && Math.abs(distanceX) > distanceY) {
            console.log('Right mouse swipe detected');
            input.onSwipedRight();
        } 
        if (isLeftSwipe && distanceX > distanceY) {
            console.log('Left mouse swipe detected');
            input.onSwipedLeft();
        }
    }

    // Return no-op handlers when disabled to prevent interference with drag and drop
    if (input.disabled) {
        console.log('useSwipe: disabled=true, returning no-op handlers');
        return {
            onTouchStart: () => {},
            onTouchMove: () => {},
            onTouchEnd: () => {},
            onMouseDown: () => {},
            onMouseMove: () => {},
            onMouseUp: () => {}
        }
    }
    
    console.log('useSwipe: disabled=false, returning real handlers');

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