#!/usr/bin/env python3
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "content.csv"
OUT_PATH = ROOT / "twee" / "ContentCSV.twee"


def main():
    csv_text = CSV_PATH.read_text(encoding="utf-8").strip()
    out = ":: ContentCSV\n" + csv_text + "\n"
    OUT_PATH.write_text(out, encoding="utf-8")


if __name__ == "__main__":
    main()
