import csv
from pathlib import Path
from random import randint

COUNTRIES_IN_AMERICAS = [
	"Antigua and Barbuda",
	"Argentina",
	"Bahamas",
	"Barbados",
	"Belize",
	"Bolivia",
	"Brazil",
	"Canada",
	"Chile",
	"Colombia",
	"Costa Rica",
	"Cuba",
	"Dominica",
	"Dominican Republic",
	"Ecuador",
	"El Salvador",
	"Grenada",
	"Guatemala",
	"Greenland",
	"Guyana",
	"Haiti",
	"Honduras",
	"Jamaica",
	"Mexico",
	"Nicaragua",
	"Panama",
	"Paraguay",
	"Peru",
	"Saint Kitts and Nevis",
	"Saint Lucia",
	"Saint Vincent and the Grenadines",
	"Suriname",
	"Trinidad and Tobago",
	"United States",
	"Uruguay",
	"Venezuela",
]

START_YEAR = 2000
END_YEAR = 2026
OUTPUT_FILE = Path(__file__).with_name("sample-data.csv")


def generate_csv(output_file=OUTPUT_FILE):
	"""Write one row per nation and year, with Nation+Year as the super key."""
	with output_file.open("w", newline="", encoding="utf-8") as csvfile:
		writer = csv.DictWriter(csvfile, fieldnames=["Nation", "Year", "TB Incidents Reported"])
		writer.writeheader()
		for nation in COUNTRIES_IN_AMERICAS:
			for year in range(START_YEAR, END_YEAR + 1):
				writer.writerow(
					{"Nation": nation, "Year": year, "TB Incidents Reported": randint(100, 1000)}
				)


if __name__ == "__main__":
	generate_csv()
