from sqlalchemy import Column, SmallInteger, DOUBLE_PRECISION
from main import Base


class yehidot_mida_lemitzrachim(Base):
    mmitzrach = SmallInteger()
    mida = SmallInteger()
    mishkal = DOUBLE_PRECISION()