import csv
import json
from pathlib import Path


project_dir = Path(__file__).resolve().parent
source_path = project_dir / "TB_burden_countries_2026-10-15.csv"
output_path = project_dir / "data" / "TB" / "Output Data" / "data.json"
output_path.parent.mkdir(parents=True, exist_ok=True)

countries = {}

with source_path.open("r", newline="", encoding="utf-8-sig") as source_file:
	reader = csv.DictReader(source_file)
	for row in reader:
		region = (row.get("g_whoregion") or "").strip().upper()
		if region == "AMR":
			country = row["country"]
			if country == "Bolivia (Plurinational State of)":
				country = "Bolivia"
			elif country == "Venezuela (Bolivarian Republic of)":
				country = "Venezuela"
		elif region == "EUR" and row["country"] == "Greenland":
			country = "Greenland"
		else:
			continue

		countries.setdefault(country, {})[row["year"]] = int(row["e_inc_num"])

country_data = [
	{"country": country, "years": years}
	for country, years in sorted(countries.items())
]

with output_path.open("w", encoding="utf-8") as output_file:
	json.dump(country_data, output_file, indent=2)
	output_file.write("\n")
