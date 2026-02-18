# from schemas import based, meals_eaten, refresh_tokens, roles, user
from . import db
from . import schemas


# schemas.based.Base.metadata.create_all(
#     db.engine,
#     tables=[
#         schemas.meals_eaten.MealsEaten.__table__,
#         schemas.refresh_tokens.RefreshTokens.__table__,
#         schemas.roles.RolesSchema.__table__,
#         schemas.user.User.__table__
#     ]
# )

schemas.based.Base.metadata.create_all(db.engine)
