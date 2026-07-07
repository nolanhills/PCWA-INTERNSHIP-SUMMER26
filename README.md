# Modern Scam Awareness Prototype

This is an experimental, static prototype for the Scam Awareness Program for Seniors.
It is separate from the existing ASP.NET/XML prototype and does not require a build step.

## How to Run

Open `index.html` in a web browser.

## What It Includes

- One complete bank fraud alert scam scenario.
- A media/story panel with fake video controls and transcript text.
- Simulated text messages, a phone call, and a fake bank screen.
- Safe, risky, and dangerous decision points.
- Immediate feedback after each decision.
- Final review with warning signs and safer real-world actions.

## Editing Notes

Most scenario content lives in the `scenario` object near the top of `app.js`.
Beginner developers can edit scene text, choices, feedback, and next scene IDs there.

Each scene can choose a media type:

- `video`
- `phone-call`
- `text-message`
- `fake-website`
- `review`

Real videos are optional. To use a local `.mp4` later, add a relative file path to a
scene's `media` object:

```js
media: {
    type: "video",
    src: "media/scene-01.mp4",
    title: "Scene 1",
    status: "Local video",
    visualTitle: "Scene title",
    visualText: "Short fallback description",
    caption: "Transcript or caption text for the scene."
}
```

Scenes without `src` use the fake video-style panel and transcript area.

This prototype intentionally uses plain HTML, CSS, and JavaScript.
