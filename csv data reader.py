import csv
from pathlib import Path


project_dir = Path(__file__).resolve().parent
source_path = project_dir / "TB_burden_countries_2026-10-15.csv"
output_path = project_dir / "data" / "data.csv"
output_path.parent.mkdir(parents=True, exist_ok=True)

with source_path.open("r", newline="", encoding="utf-8-sig") as source_file:
	reader = csv.DictReader(source_file)
	with output_path.open("w", newline="", encoding="utf-8") as output_file:
		writer = csv.writer(output_file)
		writer.writerow(["Nation", "Year", "TB Incidents Reported"])
		for row in reader:
			if (row.get("g_whoregion") or "").strip().upper() == "AMR":
				country = row["country"]
				if country == "Bolivia (Plurinational State of)":
					country = "Bolivia"
				elif country == "Venezuela (Bolivarian Republic of)":
					country = "Venezuela"
				writer.writerow([country, row["year"], row["e_inc_num"]])
			elif (row.get("g_whoregion") or "").strip().upper() == "EUR":
				country = row["country"]
				if country == "Greenland":
					writer.writerow([country, row["year"], row["e_inc_num"]])
