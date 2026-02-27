"""A Setup module for when you want to create a database to make everything u use to work"""

import csv
import os
from pathlib import Path
from typing import TypeVar

from pydantic.main import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session
from sqlalchemy_utils import create_database, database_exists

from ..schemas.based import Base
from ..schemas.moh_mitzrachim import MohMitzrachim as MohMitzrachimDB
from ..schemas.moh_yehidot_mida import YehidotMida as YehidotMidaDB
from ..schemas.moh_yehidot_mida_lemitzrachim import (
    YehidotMidaLemitzrachim as YehidotMidaLemitzrachimDB,
)
from .models import MohMitzrachim, MohYehidotMida, MohYehidotMidaLemitzrachim

T = TypeVar("T", bound=BaseModel)
S = TypeVar("S", bound=DeclarativeBase)


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


def insert_to_db(schema: type[S], models: list[T], session: Session):
    session.add_all([schema(**model.model_dump()) for model in models])
    session.commit()


if __name__ == "__main__":
    database_url = os.getenv("DATABASE_URL")
    print("Running setup.py")

    if not database_url:
        raise Exception("Env doesn't contain Docker path for container DB")
    # If the Database, exists, raise an error because setup.py should get an non-existing database.
    engine = create_engine(database_url)

    if not database_exists(engine.url):
        create_database(engine.url)
    Base.metadata.create_all(engine)

    session = Session(engine)
    print("Starting Session")

    moh_mitzrachim_file = Path("CSV/moh_mitzrachim.csv")
    moh_yehidot_mida_file = Path("CSV/moh_yehidot_mida.csv")
    moh_yehidot_mida_lemitzrachim_file = Path("CSV/moh_yehidot_mida_lemitzrachim.csv")

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

    insert_to_db(MohMitzrachimDB, mitz, session)
    insert_to_db(YehidotMidaDB, yeh, session)
    insert_to_db(YehidotMidaLemitzrachimDB, yml, session)
