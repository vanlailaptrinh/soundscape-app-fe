
import { useRef } from "react";
import "./Slider.sass";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";


library.add(faAngleLeft, faAngleRight);

export default function Slider({ children }) {
    const listRef = useRef(null);

    const scroll = (direction) => {
        if (!listRef.current) return;

        const width = listRef.current.offsetWidth;
        const scrollAmount = width / 2;

        listRef.current.scrollBy({
            left: direction * scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <div className="listWrapper">
            <button className="scrollBtn btnSliderLeft" onClick={() => scroll(-1)}>
                <FontAwesomeIcon icon={faAngleLeft} />
            </button>

            <div className="list" ref={listRef}>
                {children}
            </div>

            <button className="scrollBtn btnSliderRight" onClick={() => scroll(1)}>
                <FontAwesomeIcon icon={faAngleRight} />
            </button>
        </div>
    );
}
