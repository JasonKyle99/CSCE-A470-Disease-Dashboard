# CSCE-A470-Disease-Dashboard

When you download the files if you run 'python -m http.server 8000' in the project root, it will start a local web server on localhost:8000. It will display our index.html.

Alternatively, you can just visit the page directly at https://jasonkyle99.github.io/CSCE-A470-Disease-Dashboard/. This link will stay up to date with the latest commit of your github.

## Data files

The map loads `countries.geojson` from `data/` and the TB incident json from
`data/TB/Output Data/data.json`. 

test-chart.js, data.csv, and sample-data.csv are currently not being used by our dashboard.

## Python Scripts

The python scripts are just for compiling data from the 'TB_burden_countries_2026-10-15.csv' file. You do not need to run them, as the data has already been compiled but the instructions for doing so are below:

Run `python "csv data reader.py"` from the project root to regenerate that incident CSV from the root-level WHO source
CSV. Run `python "json data reader.py"` to write the same filtered TB incident
data to `data/TB/Output Data/data.json` as a list of countries, each with a
`years` object mapping years to incident counts. Run
`python "sample data generator.py"` to write
`data/TB/Output Data/sample-data.csv`. Store future disease datasets in their
own subfolders under `data/`.
