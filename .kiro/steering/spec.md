# Specyfikacja — Lokalny Generator Animacji Whiteboard

## Cel produktu

Narzędzie uruchamiane lokalnie, które przyjmuje dane sceny (ścieżki SVG + opcjonalne audio)
i produkuje animację „whiteboard" — ścieżki rysują się stopniowo, a dłoń z pisakiem śledzi
koniec aktualnie rysowanej linii. Wynik: podgląd w przeglądarce i eksport MP4.

## Stos technologiczny

| Warstwa | Technologia |
|---|---|
| Język | TypeScript 5 |
| UI / renderer | React 18 + Remotion 4 |
| Bundler | Vite (dev), Remotion CLI (render) |
| Format danych sceny | JSON (lokalny plik) |
| Audio | lokalny plik MP3/WAV (opcjonalny) |
| Eksport | `remotion render` → MP4 (FFmpeg pod spodem) |

## Architektura — podział warstw

```
scene-data/
  scene.json              ← dane (ścieżki SVG, timing, audio)

src/
  types/
    Scene.ts              ← typy TypeScript opisujące dane sceny
  data/
    loader.ts             ← ładuje i waliduje scene.json
  renderer/
    WhiteboardScene.tsx   ← główny komponent Remotion
    StrokePath.tsx        ← animacja pojedynczej ścieżki (strokeDashoffset)
    Hand.tsx              ← dłoń śledząca czubek pisaka
  Root.tsx                ← rejestracja kompozycji Remotion
  index.ts                ← entry point
```

Dane sceny **nigdy** nie importują komponentów renderera — przepływ jest jednostronny.

## Format danych sceny (`scene.json`)

```jsonc
{
  "fps": 30,
  "durationInSeconds": 10,
  "width": 1920,
  "height": 1080,
  "background": "#ffffff",
  "audioSrc": "./assets/narration.mp3",   // opcjonalne
  "strokes": [
    {
      "id": "stroke-1",
      "d": "M 100 200 C 150 100 300 100 350 200",
      "startFrame": 0,
      "durationFrames": 60,
      "strokeColor": "#222222",
      "strokeWidth": 3,
      "fillColor": "none"
    }
  ],
  "hand": {                        // opcjonalne
    "imageSrc": "./assets/hand.png",
    "penOffsetX": 42,
    "penOffsetY": 118,
    "width": 200,
    "height": 200
  }
}
```

## Mechanizm animacji ścieżki

Technika: **SVG stroke-dasharray / stroke-dashoffset**

1. Oblicz `pathLength` przez `SVGPathElement.getTotalLength()`.
2. Ustaw `strokeDasharray = pathLength`.
3. W każdej klatce: `progress = (currentFrame - startFrame) / durationFrames` (zacisk 0–1).
4. `strokeDashoffset = pathLength * (1 - progress)`.

## Mechanizm śledzenia dłoni

1. `SVGPathElement.getPointAtLength(progress * pathLength)` → `{x, y}`.
2. Przesuń obrazek dłoni tak, by `penOffsetX/Y` pokrył się z tym punktem.
3. Gdy żadna ścieżka nie jest rysowana → dłoń ukryta (opacity 0) lub zamrożona.

## Ryzyka techniczne

| # | Ryzyko | Prawdopodobieństwo | Wpływ | Mitygacja |
|---|---|---|---|---|
| R1 | `getTotalLength()` / `getPointAtLength()` niedostępne w środowisku headless | Wysokie | Krytyczny | Remotion używa Chromium — DOM dostępny. Wywołania tylko wewnątrz komponentu (nie na poziomie modułu). Fallback: pre-kalkulacja przez `svg-path-length` w Node.js. |
| R2 | Synchronizacja dłoni przy złożonych ścieżkach Beziera | Średnie | Średni | `getPointAtLength` jest deterministyczny — test wizualny klatka-po-klatce. |
| R3 | Audio out-of-sync w eksporcie MP4 | Średnie | Wysoki | Używać wyłącznie Remotion `<Audio>`, nigdy HTML5 `<audio>`. |
| R4 | Różnice `pathLength` między przeglądarką a Chromium headless | Niskie | Średni | Ten sam silnik Blink. Walidacja w T2. |
| R5 | Wydajność przy setkach ścieżek | Niskie | Niski | MVP = jedna scena. Odłożone. |

## Kryteria odbioru

| ID | Kryterium |
|---|---|
| A1 | `remotion studio` uruchamia się bez błędów i wyświetla płótno z parametrami z `scene.json`. |
| A2 | Ścieżka SVG rysuje się stopniowo od klatki `startFrame` do `startFrame + durationFrames`. |
| A3 | Czubek pisaka dłoni pokrywa się z aktualnym końcem ścieżki (tolerancja ±5 px). |
| A4 | Wszystkie ścieżki rysują się w kolejności wynikającej z `startFrame`. |
| A5 | Opcjonalny plik audio odtwarza się zsynchronizowany z animacją. |
| A6 | `remotion render` produkuje MP4 bez artefaktów. |
| A7 | Zmiana `scene.json` bez modyfikacji kodu TS zmienia treść animacji. |
| A8 | `tsc --noEmit` kończy się bez błędów. |

## Poza zakresem (nie implementować)

- Edytor drag & drop
- Backend PHP
- Usługi AWS
- Generowanie ilustracji AI
- Automatyczne trasowanie PNG do SVG
- Logowanie i płatności

## Plan zadań

### T1 — Środowisko + jedna ścieżka + śledzenie pisakiem ✦ pierwsze
- Inicjalizacja projektu (Remotion, TypeScript)
- Typy `Stroke` i `Hand` w `Scene.ts`
- Hardkodowana scena (jeden obiekt TS, bez JSON)
- `StrokePath.tsx` — animacja przez `strokeDashoffset`
- `Hand.tsx` — pozycja z `getPointAtLength`
- `WhiteboardScene.tsx` + rejestracja w `Root.tsx`
- **Kryterium ukończenia:** A1, A2, A3

### T2 — Ładowanie `scene.json` + wiele ścieżek
- `loader.ts` z walidacją (Zod lub ręczna)
- Render tablicy `strokes`
- **Kryterium:** A4, A7

### T3 — Audio
- Remotion `<Audio src={...} />`
- Guard na brak `audioSrc`
- **Kryterium:** A5

### T4 — Eksport MP4 i weryfikacja
- `remotion render`, porównanie z podglądem
- **Kryterium:** A6, A8

### T5 — Dopracowanie dłoni i edge-case'y
- Pełna obsługa `penOffsetX/Y`
- Zachowanie dłoni między ścieżkami
- Testy manualne różnych kształtów SVG
