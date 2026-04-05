"""
A Setup module for when you want to create a database to make everything u use to work
A Setup Script, For when first setting up the project (preferably through docker compose)

simply running setup.py with the correct DB, user and password will generate the correct tables and inital data.

NOTE: This script must be run at migration 7fcc6d99d6fb (the first migration, `alembic upgrade +1` from base).
      Later migrations add columns (e.g. search_name) that don't exist yet at this point.
      After running this script, continue with `alembic upgrade head` to apply the remaining migrations.
"""

import csv
from pathlib import Path
from typing import TypeVar

import sqlalchemy as sa
from pydantic.main import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy_utils import create_database, database_exists

from core.config import settings

from .models import MohMitzrachim, MohYehidotMida, MohYehidotMidaLemitzrachim

T = TypeVar("T", bound=BaseModel)


def read_csv_file(f_csv: Path, ValidationModel: type[T]) -> list[T]:
    """Given a CSV file from israeli-foods, check them via pydantic models to make sure they are file, if they are, return list of pydantic instances."""
    res: list[T] = []
    with open(f_csv, encoding="utf-8-sig") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:

            for k, v in row.items():
                if v == "":
                    row[k] = None

            model: T = ValidationModel.model_validate(row, from_attributes=True)

            res.append(model)
    return res


def insert_to_db(table_name: str, models: list[T], session: Session):
    """Insert rows using Core SQL based on pydantic model fields (ORM-independent)."""
    if not models:
        return
    keys = list(models[0].model_dump().keys())
    stmt = sa.text(
        f"INSERT INTO {table_name} ({', '.join(keys)}) "
        f"VALUES ({', '.join(':' + k for k in keys)})"
    )
    session.execute(stmt, [model.model_dump() for model in models])
    session.commit()


if __name__ == "__main__":
    print("Running setup.py")
    # If the Database, exists, raise an error because setup.py should get an non-existing database.
    engine = create_engine(str(settings.DATABASE_URL))

    # if not database_exists(engine.url):
    #     create_database(engine.url)

    # Base.metadata.create_all(engine)

    session = Session(engine)
    print("Starting Session")
    # Get project root based on the location of this file
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    CSV_DIR = BASE_DIR / "scripts" / "CSV"

    moh_mitzrachim_file = CSV_DIR / "moh_mitzrachim.csv"
    moh_yehidot_mida_file = CSV_DIR / "moh_yehidot_mida.csv"
    moh_yehidot_mida_lemitzrachim_file = CSV_DIR / "moh_yehidot_mida_lemitzrachim.csv"

    print("Importing CSV Files")

    mitz: list[MohMitzrachim] = read_csv_file(moh_mitzrachim_file, MohMitzrachim)
    yeh: list[MohYehidotMida] = read_csv_file(
        moh_yehidot_mida_file,
        MohYehidotMida,
    )
    yehmle: list[MohYehidotMidaLemitzrachim] = read_csv_file(
        moh_yehidot_mida_lemitzrachim_file,
        MohYehidotMidaLemitzrachim,
    )

    PK_mitz = {x.code for x in mitz}
    PK_yeh = {x.smlmida for x in yeh}

    # NOTE: for some reason, MohYehidotMidaLemitzrachim is a many-to-many table that contains foreign keys that doesnt exist in the other tables, so we decided to filter them out.
    yml: list[MohYehidotMidaLemitzrachim] = [
        x for x in yehmle if x.mida in PK_yeh and x.mmitzrach in PK_mitz
    ]
    print("Adding them to the database")

    insert_to_db("moh_mitzrachim", mitz, session)
    insert_to_db("moh_yehidot_mida", yeh, session)
    insert_to_db("moh_yehidot_mida_lemitzrachim", yml, session)
