import { jsx as _jsx } from "preact/jsx-runtime";
import { useEffect, useRef } from 'preact/hooks';
export const Menu = (props) => {
    const the_menu = useRef(null);
    const closes = useRef(props.closes);
    closes.current = props.closes;
    useEffect(() => {
        const menu = the_menu.current;
        if (menu === null || !('showPopover' in menu))
            return;
        const closed = (event) => {
            if (event instanceof ToggleEvent && event.newState === 'closed' && menu.isConnected)
                closes.current();
        };
        menu.addEventListener('toggle', closed);
        menu.showPopover();
        return () => {
            menu.removeEventListener('toggle', closed);
        };
    }, []);
    return (_jsx("nav", { class: "menu", "aria-label": props.label, popover: "auto", ref: the_menu, children: props.children }));
};
