from pydantic.main import BaseModel
from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase
from pathlib import Path
# pyright: ignore[reportAttributeAccessIssue]
from sqlalchemy_utils import create_database, database_exists
from sqlalchemy.orm import Session

from ..schemas.moh_mitzrachim import MohMitzrachim as MohMitzrachimDB
from ..schemas.moh_yehidot_mida import YehidotMida as YehidotMidaDB
from ..schemas.moh_yehidot_mida_lemitzrachim import YehidotMidaLemitzrachim as YehidotMidaLemitzrachimDB
from ..schemas.based import Base


from .models import MohMitzrachim, MohYehidotMida, MohYehidotMidaLemitzrachim
import csv


def read_csv_file(f_csv: Path, ValidationModel: type[BaseModel]) -> list[type[BaseModel]]:
    res: list[type[BaseModel]] = []
    with open(f_csv, encoding='utf-8-sig') as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:

            for k, v in row.items():
                if v == '':
                    row[k] = None

            model: type[BaseModel] = ValidationModel.model_validate(  # pyright: ignore[reportAssignmentType]
                row, from_attributes=True)

            res.append(model)
    return res


def insert_to_db(schema: type[DeclarativeBase], models: list[type[BaseModel]], session: Session):
    existing_codes = {
        code for code in session.execute(select(MohMitzrachimDB.code)).all()
    }

    objects = []
    for model in models:
        data = model.model_dump()

        if schema.__tablename__ == "moh_yehidot_mida_lemitzrachim":
            if data["mmitzrach"] not in existing_codes:
                continue  # skip invalid FK row

        objects.append(schema(**data))

    session.add_all(objects)
    session.commit()


if __name__ == '__main__':
    # If the Database, exists, raise an error because setup.py should get an non-existing database.
    engine = create_engine(
        "postgresql://postgres:postgres@localhost:5432/HEY")

    if not database_exists(engine.url):
        create_database(engine.url)
    Base.metadata.create_all(engine)

    session = Session(engine)

    moh_mitzrachim_file = Path("CSV/moh_mitzrachim.csv")
    moh_yehidot_mida_file = Path("CSV/moh_yehidot_mida.csv")
    moh_yehidot_mida_lemitzrachim_file = Path(
        "CSV/moh_yehidot_mida_lemitzrachim.csv")

    mitz = read_csv_file(moh_mitzrachim_file, MohMitzrachim)
    yeh = read_csv_file(moh_yehidot_mida_file, MohYehidotMida)
    yehmle = read_csv_file(moh_yehidot_mida_lemitzrachim_file,
                           MohYehidotMidaLemitzrachim)

    # insert_to_db(MohMitzrachimDB, mitz, session)
    # insert_to_db(YehidotMidaDB, yeh, session)

    insert_to_db(YehidotMidaLemitzrachimDB, yehmle, session)
