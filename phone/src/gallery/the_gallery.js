import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
const both = ['light', 'dark'];
const AStory = (props) => (_jsxs("article", { class: "gallery-story", "data-story": props.story.id, children: [_jsx("h3", { children: _jsx("a", { href: `?story=${props.story.id}`, children: props.story.name }) }), _jsx("div", { "data-part": "themes", children: props.themes.map((theme) => (_jsxs("div", { "data-part": "theme", "data-theme": theme, children: [_jsx("small", { "data-part": "theme-name", children: props.texts.themes[theme] }), props.story.render()] }, theme))) })] }));
export const TheGallery = (props) => {
    const shows = props.shows;
    if (shows.shows === 'a_story') {
        const story = props.files
            .flatMap((file) => file.stories)
            .find((each) => each.id === shows.story);
        return (_jsxs("main", { class: "gallery", "data-state": "a_story", children: [story === undefined ? (_jsx("p", { role: "alert", children: props.texts.no_such_story(shows.story) })) : (_jsx(AStory, { story: story, themes: shows.themes, texts: props.texts })), _jsx("p", { "data-part": "all", children: _jsx("a", { href: "?", children: props.texts.all_the_stories }) })] }));
    }
    return (_jsxs("main", { class: "gallery", "data-state": "everything", children: [_jsxs("header", { children: [_jsx("h1", { children: props.texts.title }), _jsx("p", { children: props.texts.intro }), _jsx("nav", { children: _jsx("ul", { children: props.files.map((file) => (_jsx("li", { children: _jsx("a", { href: `#${file.id}`, children: file.title }) }, file.id))) }) })] }), props.files.map((file) => (_jsxs("section", { id: file.id, "aria-label": file.title, children: [_jsx("h2", { children: file.title }), file.stories.map((story) => (_jsx(AStory, { story: story, themes: both, texts: props.texts }, story.id)))] }, file.id)))] }));
};
