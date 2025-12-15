# CAP Alerts Web - Historical Alert Map Viewer

An interactive map viewer for historical Common Alerting Protocol (CAP) emergency alerts in New Zealand. This application provides a visual interface for exploring archived emergency alert data for research, analysis, and educational purposes.

> [!DANGER]
> **THIS APPLICATION IS NOT FOR EMERGENCY USE**
>
> This application is an archive of **historical** Common Alerting Protocol (CAP) messages for research, analysis, and educational purposes only.
>
> - This site is **NOT** connected to any live emergency alert systems
> - Data may be incomplete, delayed, or inaccurate
> - **NEVER** rely on this application for safety decisions or emergency response
>
> For current emergency information, always refer to official sources such as Civil Defence, MetService, or emergency services directly.

## What are CAP Alerts?

The Common Alerting Protocol (CAP) is an international standard format for exchanging emergency alerts and public warnings. CAP alerts are used by emergency management organizations to disseminate information about:

- **Weather events** (Met) - storms, floods, severe weather
- **Geological events** (Geo) - earthquakes, tsunamis, volcanic activity
- **Safety alerts** - public safety warnings
- **Security alerts** - security-related warnings
- **Rescue operations** - search and rescue activities
- **Fire alerts** - wildfires, structure fires
- **Health alerts** - public health emergencies
- **Environmental alerts** (Env) - environmental hazards
- **Transport alerts** - transportation disruptions
- **Infrastructure alerts** (Infra) - critical infrastructure issues
- **CBRNE alerts** - Chemical, Biological, Radiological, Nuclear, or Explosive incidents

Each CAP alert contains structured information including:

- Alert category, urgency, severity, and certainty levels
- Geographic areas affected (often as polygon coordinates)
- Event descriptions and instructions
- Sender information and timestamps
- Alert status (Actual, Test, Exercise, etc.)

## Data Flow

The alert data used by this application follows this pipeline:

1. **Google Apps Script** - A script periodically fetches CAP alert feeds from multiple sources
2. **Google Spreadsheet** - The fetched alerts are stored in a Google Spreadsheet
3. **CSV Export** - The spreadsheet data is exported as CSV format
4. **Site Build** - The CSV file is fetched and processed to build the interactive map viewer

> [!INFO]
> To fetch the latest data, you'll need to set up the `GOOGLE_SHEET_ID` environment variable or pass it as an argument when running the fetch command.

To fetch the latest data, run:

```bash
npm run fetch-data
```

This requires the `GOOGLE_SHEET_ID` environment variable to be set, or you can pass it as an argument:

```bash
GOOGLE_SHEET_ID=your-sheet-id npm run fetch-data
```

## 🚀 Project Structure

```
/
├── public/
│   └── data/
│       └── cap.csv          # Alert data (fetched from Google Sheets)
├── src/
│   ├── components/
│   │   └── react/           # React components for the map viewer
│   ├── hooks/               # Custom React hooks
│   ├── pages/
│   │   └── index.astro     # Main page
│   ├── services/            # Data processing services
│   ├── styles/              # Global styles
│   └── utils/               # Utility functions
├── scripts/
│   └── fetch-data.sh        # Script to fetch data from Google Sheets
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run fetch-data`      | Fetch latest alert data from Google Sheets       |
| `npm run format`          | Format code with Prettier                        |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Features

- **Interactive Map** - View alerts on an interactive map powered by MapLibre GL
- **Filtering** - Filter alerts by category, severity, urgency, date range, and more
- **Search** - Search alerts by title, description, or area
- **Alert Details** - View detailed information about each alert including full CAP XML
- **Timeline View** - See alert updates and cancellations grouped together
- **Dark Mode** - Automatic dark mode support based on system preferences
- **URL State** - Shareable URLs that preserve filter and selection state

## Technology Stack

- **Astro** - Static site generator
- **React** - UI components
- **MapLibre GL** - Interactive mapping
- **Tailwind CSS** - Styling
- **PapaParse** - CSV parsing
- **Framer Motion** - Animations

## Development

### Prerequisites

- Node.js (Latest LTS recommended)
- npm

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Fetch the alert data (requires `GOOGLE_SHEET_ID`):

> [!NOTE]
> You'll need to set the `GOOGLE_SHEET_ID` environment variable or pass it as an argument. See the [Data Flow](#data-flow) section for more details.

```bash
npm run fetch-data
```

4. Start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:4321`

### Building for Production

```bash
npm run build
```

The built site will be in the `dist/` directory.

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).

```
Copyright (C) 2024 [Your Name]

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

For the full license text, see [LICENSE](LICENSE) file or visit [https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html).
