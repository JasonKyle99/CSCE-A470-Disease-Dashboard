# CSCE-A470-Disease-Dashboard

## Data files

The map loads `countries.geojson` from `data/` and the TB incident CSV from
`data/TB/Output Data/data.csv`. Run `python "csv data reader.py"` from the
project root to regenerate that incident CSV from the root-level WHO source
CSV. Run `python "sample data generator.py"` to write
`data/TB/Output Data/sample-data.csv`. Store future disease datasets in their
own subfolders under `data/`.