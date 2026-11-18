import csv
import json
import re
import sys
from collections import defaultdict
from pathlib import Path


DASHES = {"-", "", "na", "n/a", "nan", "none", "null"}

##Checks for ints, excludes common indications of no data
def to_int(value):
    if value is None:
        return None
    s = str(value).strip()
    if s.lower() in DASHES:
        return None
    s = s.replace(",", "")
    try:
        return int(float(s))
    except ValueError:
        return None

#Addition function so that addition can occur without errors. Data needs addition because it is by semester and not year
def add(a, b):
    if a is None and b is None:
        return None
    return (a or 0) + (b or 0)


def norm_disease(name):
#handles different strains of TB
    if not name:
        return "unknown"
    n = name.strip()
    low = n.lower()
    if "bovine tuberculosis" in low or "mycobacterium tuberculosis complex" in low:
        return "bovine_tuberculosis"
    # generic cleanup: lowercase, strip parenthetical date ranges
    n = re.sub(r"\([^)]*\)", "", n)
    n = re.sub(r"[^a-z0-9]+", "_", n.lower()).strip("_")
    return n or "unknown"

#Normalize species names
def norm_species(name):
    if not name:
        return None
    s = name.strip()
    if s.lower() in DASHES:
        return None
    return s


def parse_year(value):
    return to_int(value)



def blank_species():
    return {
        "susceptible": None,
        "cases": None,
        "deaths": None,
        "killed_and_disposed_of": None,
        "slaughtered": None,
        "vaccinated": None,
    }


def blank_disease():
    return {
        "new_outbreaks": None,
        "animal_categories": set(),
        "species": defaultdict(blank_species),
    }


def ingest(rows):
#Header rows that relate to the data
    data = defaultdict(lambda: defaultdict(lambda: defaultdict(blank_disease)))

    for row in rows:
        country = (row.get("Country") or "").strip()
        if not country:
            continue

        year = parse_year(row.get("Year"))
        if year is None:
            continue

        disease = norm_disease(row.get("Disease"))
        node = data[country][year][disease]

#Outbreak count
        outbreaks = to_int(row.get("New outbreaks"))
        if outbreaks is not None:
            node["new_outbreaks"] = add(node["new_outbreaks"], outbreaks)

        cat = (row.get("Animal Category") or "").strip()
        if cat and cat.lower() not in DASHES:
            node["animal_categories"].add(cat)

        species = norm_species(row.get("Species"))
        if species is None:
            continue

        sp = node["species"][species]

        sp["cases"] = add(sp["cases"], to_int(row.get("Cases")))
        sp["susceptible"] = add(sp["susceptible"], to_int(row.get("Susceptible")))
        sp["deaths"] = add(sp["deaths"], to_int(row.get("Deaths")))
        sp["killed_and_disposed_of"] = add(
            sp["killed_and_disposed_of"], to_int(row.get("Killed and disposed of"))
        )
        sp["slaughtered"] = add(sp["slaughtered"], to_int(row.get("Slaughtered")))
        sp["vaccinated"] = add(sp["vaccinated"], to_int(row.get("Vaccinated")))

    return data


def finalize(data):
#Final conversion from csv to json
    out = {}
    for country, years in data.items():
        out[country] = {}
        for year, diseases in years.items():
            out[country][str(year)] = {}
            for disease, node in diseases.items():
                species_out = {}
                for sp_name, sp in node["species"].items():
                    species_out[sp_name] = dict(sp)
                out[country][str(year)][disease] = {
                    "new_outbreaks": node["new_outbreaks"],
                    "animal_categories": sorted(node["animal_categories"]),
                    "species": species_out,
                }
    return out

def read_rows(path):
    p = Path(path)

    text = p.read_text(encoding="utf-8-sig")
    lines = text.splitlines()
    first_line = lines[0] if lines else ""

    reader = csv.DictReader(lines, delimiter=",")
    return [r for r in reader]


def main():
    path = "Quantitative data 2026-10-25.csv"
    rows = read_rows(path)
    data = ingest(rows)
    result = finalize(data)

    Path("WAHIS-Data.json").write_text(
        json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"wrote {path}: {len(result)} countries")


if __name__ == "__main__":
    main()
