"""create initial schema

Revision ID: 7fcc6d99d6fb
Revises:
Create Date: 2026-03-19 20:35:02.787122

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7fcc6d99d6fb"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # --- Independent tables (no FKs) ---

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column(
            "disabled", sa.BOOLEAN(), server_default=sa.text("false"), nullable=False
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "moh_mitzrachim",
        sa.Column("code", sa.SmallInteger(), nullable=False),
        sa.Column("smlmitzrach", sa.Integer(), nullable=False),
        sa.Column("shmmitzrach", sa.String(length=255), nullable=False),
        sa.Column("makor", sa.SmallInteger(), nullable=True),
        sa.Column("protein", sa.DOUBLE_PRECISION(), nullable=False),
        sa.Column("total_fat", sa.DOUBLE_PRECISION(), nullable=False),
        sa.Column("carbohydrates", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("food_energy", sa.SmallInteger(), nullable=False),
        sa.Column("alcohol", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("total_dietary_fiber", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("calcium", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("iron", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("magnesium", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("sodium", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("cholesterol", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("saturated_fat", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("fructose", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("vitamin_a_iu", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("vitamin_e", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("vitamin_c", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("vitamin_b6", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("vitamin_b12", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("vitamin_k", sa.DOUBLE_PRECISION(), nullable=True),
        sa.Column("english_name", sa.String(length=255), nullable=True),
        sa.Column("tarich_ptiha", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("code"),
    )

    op.create_table(
        "moh_yehidot_mida",
        sa.Column("smlmida", sa.SmallInteger(), nullable=False),
        sa.Column("shmmida", sa.String(length=30), nullable=False),
        sa.PrimaryKeyConstraint("smlmida"),
    )

    # --- Tables with FKs ---

    op.create_table(
        "moh_yehidot_mida_lemitzrachim",
        sa.Column("mmitzrach", sa.SmallInteger(), nullable=False),
        sa.Column("mida", sa.SmallInteger(), nullable=False),
        sa.Column("mishkal", sa.DOUBLE_PRECISION(), nullable=False),
        sa.ForeignKeyConstraint(["mmitzrach"], ["moh_mitzrachim.code"]),
        sa.ForeignKeyConstraint(["mida"], ["moh_yehidot_mida.smlmida"]),
        sa.PrimaryKeyConstraint("mmitzrach", "mida"),
    )

    op.create_table(
        "meals_eaten",
        sa.Column("id", sa.SmallInteger(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("code_id", sa.SmallInteger(), nullable=False),
        sa.Column("mida_id", sa.SmallInteger(), nullable=False),
        sa.Column("amount", sa.DOUBLE_PRECISION(), nullable=False),
        sa.Column(
            "meal_type",
            sa.Enum("BREAKFAST", "LUNCH", "DINNER", name="mealtype"),
            nullable=False,
        ),
        sa.Column("date", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["code_id"], ["moh_mitzrachim.code"]),
        sa.ForeignKeyConstraint(["mida_id"], ["moh_yehidot_mida.smlmida"]),
        sa.ForeignKeyConstraint(
            ["code_id", "mida_id"],
            [
                "moh_yehidot_mida_lemitzrachim.mmitzrach",
                "moh_yehidot_mida_lemitzrachim.mida",
            ],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.VARCHAR(length=255), nullable=False),
        sa.Column(
            "revoked", sa.BOOLEAN(), server_default=sa.text("false"), nullable=False
        ),
        sa.Column("replaced_by_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["replaced_by_id"], ["refresh_tokens.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "role_type", sa.Enum("ADMIN", "USER", name="rolesenum"), nullable=False
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop in reverse dependency order
    op.drop_table("roles")
    op.drop_table("refresh_tokens")
    op.drop_table("meals_eaten")
    op.drop_table("moh_yehidot_mida_lemitzrachim")
    op.drop_table("moh_yehidot_mida")
    op.drop_table("moh_mitzrachim")
    op.drop_table("users")

    # Drop enums
    sa.Enum(name="mealtype").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="rolesenum").drop(op.get_bind(), checkfirst=True)
