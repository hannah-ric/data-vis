# data-vis

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```
   Ensure you have Node.js installed. This installs the packages listed in `package.json`.

2. **Start Development Server**

   ```bash
   npm run dev
   ```
   This command usually starts a local development server for interactive development.

3. **Build for Production**

   ```bash
   npm run build
   ```
   This step generates optimized assets ready for deployment.

## Sample Datasets

Sample JSON datasets are available in the `data/` directory:

- `bar-data.json` – values for a bar chart
- `line-data.json` – values over time for a line chart
- `scatter-data.json` – pairs of points for a scatter plot

## Sample Charts

D3 chart modules are located in the `src/` directory. A small HTML page (`src/sample.html`) demonstrates rendering a bar, line and scatter chart using these modules and datasets.

Open the HTML file in a browser or serve the project with a static server to view the charts.

## Keyboard Shortcuts

The project does not define custom keyboard shortcuts yet.

## License

This repository does not currently include a license file.
