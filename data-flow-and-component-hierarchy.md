# Surfe Diem App: Data Flow & Component Hierarchy

This document contains two Mermaid diagrams for the Surfe Diem app:
- **Data Flow** (high-level API and data movement)
- **Home Page Component Hierarchy** (detailed React component tree)

You can preview or export these diagrams using the [Mermaid Live Editor](https://mermaid.live/) or a compatible Markdown/Mermaid tool. Set the theme to **light** ("default") for best results in docs.

---

## 1. Data Flow Diagram

```mermaid
flowchart TD
  A["User visits page (e.g., SpotPage)"]
  B["React Query useQuery triggers"]
  C1["getSurfSpot (API: /spots/:id)"]
  C2["getClostestTideStation (API: /tides/find_closest)"]
  C3["getDailyTides (API: /tides)"]
  C4["getForecastHourly (API: /forecast)"]
  C5["getForecastCurrent (API: /forecast)"]
  C6["getCurrentWeather (API: /weather)"]
  D["Data passed to React components for rendering"]

  A --> B
  B --> C1
  C1 --> C2
  C2 --> C3
  C1 --> C4
  C1 --> C5
  C1 --> C6
  C3 --> D
  C4 --> D
  C5 --> D
  C6 --> D
```

---

## 2. Home Page Component Hierarchy

```mermaid
flowchart TD
  Home["<Home>"]
  Container1["<Container> (main wrapper)"]
  Item1["<Item> (header card)"]
  Box1["<Box> (header image, title, subtitle)"]
  GridMain["<Grid container>"]
  GridBuoys["<Grid item> (Buoys)"]
  ItemBuoys["<Item>"]
  BoxBuoys["<Box>"]
  BasicSelectBuoys["<BasicSelect> (buoy select)"]
  GridSpots["<Grid item> (Spots)"]
  ItemSpots["<Item>"]
  BoxSpots["<Box>"]
  BasicSelectSpots["<BasicSelect> (spot select)"]
  BoxGeo["<Box> (Surf spots nearby)"]
  SpotGlance["<SpotGlance>"]
  Item2["<Item> (Featured spots section)"]
  Box2["<Box> (featured image bg)"]
  Box3["<Box> (featured spots content)"]
  TypographyFeat["<Typography> (Featured spots title)"]
  Item3["<Item>"]
  StackFeat["<Stack>"]
  SpotSummary["<SpotSummary> (xN, for each featured spot)"]

  Home --> Container1
  Container1 --> Item1
  Item1 --> Box1
  Container1 --> GridMain
  GridMain --> GridBuoys
  GridBuoys --> ItemBuoys
  ItemBuoys --> BoxBuoys
  BoxBuoys --> BasicSelectBuoys
  GridMain --> GridSpots
  GridSpots --> ItemSpots
  ItemSpots --> BoxSpots
  BoxSpots --> BasicSelectSpots
  Container1 --> BoxGeo
  BoxGeo --> SpotGlance
  Container1 --> Item2
  Item2 --> Box2
  Box2 --> Box3
  Box3 --> TypographyFeat
  Box3 --> Item3
  Item3 --> StackFeat
  StackFeat --> SpotSummary

  %% SpotGlance and SpotSummary have their own subtrees:
  SpotGlance -.-> ItemGlance["<Item> (per spot)"]
  ItemGlance -.-> ButtonGlance["<Button>"]
  ItemGlance -.-> TypographyGlance["<Typography> (spot name, subregion)"]

  SpotSummary -.-> Card["<Card>"]
  Card -.-> CardContent["<CardContent>"]
  CardContent -.-> TypographySum["<Typography> (name, subregion, coords, etc.)"]
  CardContent -.-> BoxSum["<Box> (current conditions)"]
  Card -.-> CardActions["<CardActions>"]
  CardActions -.-> ButtonSum["<Button> (View spot)"]
```

---

**Instructions:**
- Copy the code blocks above into the [Mermaid Live Editor](https://mermaid.live/) or your favorite Mermaid-compatible tool.
- Set the theme to **default** (light) for best results.
- Export as PNG or SVG as needed for your documentation. 