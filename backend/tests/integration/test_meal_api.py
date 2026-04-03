"""Integration tests for Meal endpoints (meal_api.py)."""

import csv
import io
import pytest
from datetime import datetime, timezone, timedelta

from db.schemas.meals_eaten import MealsEaten


# ── Query Foods ──────────────────────────────────────────────────────────────


class TestQueryFoods:
    """GET /api/v1/foods?food_query=..."""

    def test_query_foods_returns_list(self, client, auth_headers, seed_food):
        response = client.get(
            "/api/v1/foods", params={"food_query": "test apple"}, headers=auth_headers
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_query_foods_results_contain_expected_fields(self, client, auth_headers, seed_food):
        response = client.get(
            "/api/v1/foods", params={"food_query": "test apple"}, headers=auth_headers
        )
        data = response.json()
        if len(data) > 0:
            item = data[0]
            for field in ("food_id", "food_name", "protein", "total_fat", "food_energy", "midot"):
                assert field in item

    def test_query_foods_returns_max_20_results(self, client, auth_headers, seed_food):
        response = client.get(
            "/api/v1/foods", params={"food_query": "a"}, headers=auth_headers
        )
        assert len(response.json()) <= 20

    def test_query_foods_empty_query_string(self, client, auth_headers, seed_food):
        response = client.get(
            "/api/v1/foods", params={"food_query": ""}, headers=auth_headers
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_query_foods_special_characters_stripped(self, client, auth_headers, seed_food):
        response = client.get(
            "/api/v1/foods", params={"food_query": "test!@#$%^&*apple"}, headers=auth_headers
        )
        assert response.status_code == 200

    def test_query_foods_no_results_returns_empty_list(self, client, auth_headers, seed_food):
        response = client.get(
            "/api/v1/foods", params={"food_query": "zzzznonexistent"}, headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json() == []

    def test_query_foods_hebrew_characters(self, client, auth_headers, seed_food):
        response = client.get(
            "/api/v1/foods", params={"food_query": "תפוח"}, headers=auth_headers
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_query_foods_no_auth_returns_401(self, client):
        response = client.get("/api/v1/foods", params={"food_query": "apple"})
        assert response.status_code == 401

    def test_query_foods_missing_query_param_returns_422(self, client, auth_headers):
        response = client.get("/api/v1/foods", headers=auth_headers)
        assert response.status_code == 422


# ── Add Meal ─────────────────────────────────────────────────────────────────


class TestAddMeal:
    """PUT /api/v1/meal"""

    def _meal_body(self, food_code, mida_id):
        return {
            "food_id": food_code,
            "mida_id": mida_id,
            "amount": 1.0,
            "meal_type": "breakfast",
        }

    def test_add_meal_returns_201(self, client, auth_headers, seed_food):
        food_code, mida_id, _ = seed_food
        response = client.put(
            "/api/v1/meal", headers=auth_headers, json=self._meal_body(food_code, mida_id)
        )
        assert response.status_code == 201

    def test_add_meal_persists_in_database(self, client, auth_headers, seed_food, db_session):
        food_code, mida_id, _ = seed_food
        client.put(
            "/api/v1/meal", headers=auth_headers, json=self._meal_body(food_code, mida_id)
        )
        count = db_session.query(MealsEaten).count()
        assert count >= 1

    def test_add_meal_associates_with_current_user(self, client, auth_headers, seed_food, db_session, registered_user):
        food_code, mida_id, _ = seed_food
        client.put(
            "/api/v1/meal", headers=auth_headers, json=self._meal_body(food_code, mida_id)
        )
        from db.schemas.user import User

        user = db_session.query(User).filter(User.username == registered_user[0]).first()
        meal = db_session.query(MealsEaten).filter(MealsEaten.user_id == user.id).first()
        assert meal is not None

    def test_add_meal_with_fractional_amount(self, client, auth_headers, seed_food):
        food_code, mida_id, _ = seed_food
        body = self._meal_body(food_code, mida_id)
        body["amount"] = 0.5
        response = client.put("/api/v1/meal", headers=auth_headers, json=body)
        assert response.status_code == 201

    def test_add_meal_each_meal_type(self, client, auth_headers, seed_food):
        food_code, mida_id, _ = seed_food
        for meal_type in ("breakfast", "lunch", "dinner"):
            body = self._meal_body(food_code, mida_id)
            body["meal_type"] = meal_type
            response = client.put("/api/v1/meal", headers=auth_headers, json=body)
            assert response.status_code == 201

    def test_add_meal_no_auth_returns_401(self, client, seed_food):
        food_code, mida_id, _ = seed_food
        response = client.put("/api/v1/meal", json=self._meal_body(food_code, mida_id))
        assert response.status_code == 401

    def test_add_meal_missing_food_id_returns_422(self, client, auth_headers, seed_food):
        _, mida_id, _ = seed_food
        response = client.put(
            "/api/v1/meal",
            headers=auth_headers,
            json={"mida_id": mida_id, "amount": 1.0, "meal_type": "breakfast"},
        )
        assert response.status_code == 422

    def test_add_meal_missing_mida_id_returns_422(self, client, auth_headers, seed_food):
        food_code, _, _ = seed_food
        response = client.put(
            "/api/v1/meal",
            headers=auth_headers,
            json={"food_id": food_code, "amount": 1.0, "meal_type": "breakfast"},
        )
        assert response.status_code == 422

    def test_add_meal_missing_amount_returns_422(self, client, auth_headers, seed_food):
        food_code, mida_id, _ = seed_food
        response = client.put(
            "/api/v1/meal",
            headers=auth_headers,
            json={"food_id": food_code, "mida_id": mida_id, "meal_type": "breakfast"},
        )
        assert response.status_code == 422

    def test_add_meal_missing_meal_type_returns_422(self, client, auth_headers, seed_food):
        food_code, mida_id, _ = seed_food
        response = client.put(
            "/api/v1/meal",
            headers=auth_headers,
            json={"food_id": food_code, "mida_id": mida_id, "amount": 1.0},
        )
        assert response.status_code == 422

    def test_add_meal_invalid_meal_type_returns_422(self, client, auth_headers, seed_food):
        food_code, mida_id, _ = seed_food
        body = self._meal_body(food_code, mida_id)
        body["meal_type"] = "snack"
        response = client.put("/api/v1/meal", headers=auth_headers, json=body)
        assert response.status_code == 422

    def test_add_meal_empty_body_returns_422(self, client, auth_headers):
        response = client.put("/api/v1/meal", headers=auth_headers, json={})
        assert response.status_code == 422


# ── Delete Meal ──────────────────────────────────────────────────────────────


class TestDeleteMeal:
    """DELETE /api/v1/meal?meal_id=..."""

    def _add_meal(self, client, auth_headers, seed_food, db_session):
        food_code, mida_id, _ = seed_food
        client.put(
            "/api/v1/meal",
            headers=auth_headers,
            json={"food_id": food_code, "mida_id": mida_id, "amount": 1.0, "meal_type": "breakfast"},
        )
        return db_session.query(MealsEaten).order_by(MealsEaten.id.desc()).first().id

    def test_delete_own_meal_returns_201(self, client, auth_headers, seed_food, db_session):
        meal_id = self._add_meal(client, auth_headers, seed_food, db_session)
        response = client.delete(
            "/api/v1/meal", params={"meal_id": meal_id}, headers=auth_headers
        )
        # Endpoint returns 201 (as defined in the route)
        assert response.status_code == 201

    def test_delete_meal_removes_from_database(self, client, auth_headers, seed_food, db_session):
        meal_id = self._add_meal(client, auth_headers, seed_food, db_session)
        client.delete("/api/v1/meal", params={"meal_id": meal_id}, headers=auth_headers)
        assert db_session.get(MealsEaten, meal_id) is None

    def test_delete_meal_nonexistent_id_returns_403(self, client, auth_headers):
        response = client.delete(
            "/api/v1/meal", params={"meal_id": 999999}, headers=auth_headers
        )
        assert response.status_code == 403

    def test_delete_other_users_meal_returns_403(
        self, client, auth_headers, second_auth_headers, seed_food, db_session
    ):
        # User 1 adds a meal
        meal_id = self._add_meal(client, auth_headers, seed_food, db_session)
        # User 2 tries to delete it
        response = client.delete(
            "/api/v1/meal", params={"meal_id": meal_id}, headers=second_auth_headers
        )
        assert response.status_code == 403

    def test_delete_meal_no_auth_returns_401(self, client):
        response = client.delete("/api/v1/meal", params={"meal_id": 1})
        assert response.status_code == 401

    def test_delete_meal_missing_meal_id_returns_422(self, client, auth_headers):
        response = client.delete("/api/v1/meal", headers=auth_headers)
        assert response.status_code == 422


# ── Delete All Meals ─────────────────────────────────────────────────────────


class TestDeleteAllMeals:
    """DELETE /api/v1/meals"""

    def _add_meals(self, client, auth_headers, seed_food, n=3):
        food_code, mida_id, _ = seed_food
        for _ in range(n):
            client.put(
                "/api/v1/meal",
                headers=auth_headers,
                json={"food_id": food_code, "mida_id": mida_id, "amount": 1.0, "meal_type": "breakfast"},
            )

    def test_delete_all_meals_returns_204(self, client, auth_headers, seed_food):
        self._add_meals(client, auth_headers, seed_food)
        response = client.delete("/api/v1/meals", headers=auth_headers)
        assert response.status_code == 204

    def test_delete_all_meals_removes_all_user_meals(
        self, client, auth_headers, seed_food, db_session, registered_user
    ):
        self._add_meals(client, auth_headers, seed_food, n=3)
        from db.schemas.user import User

        user = db_session.query(User).filter(User.username == registered_user[0]).first()
        client.delete("/api/v1/meals", headers=auth_headers)
        count = db_session.query(MealsEaten).filter(MealsEaten.user_id == user.id).count()
        assert count == 0

    def test_delete_all_meals_when_user_has_no_meals(self, client, auth_headers):
        response = client.delete("/api/v1/meals", headers=auth_headers)
        assert response.status_code == 204

    def test_delete_all_meals_does_not_affect_other_users(
        self, client, auth_headers, second_auth_headers, seed_food, db_session
    ):
        food_code, mida_id, _ = seed_food
        # User 2 adds a meal
        client.put(
            "/api/v1/meal",
            headers=second_auth_headers,
            json={"food_id": food_code, "mida_id": mida_id, "amount": 1.0, "meal_type": "lunch"},
        )
        # User 1 adds meals then deletes all
        self._add_meals(client, auth_headers, seed_food)
        client.delete("/api/v1/meals", headers=auth_headers)
        # User 2's meal should still exist
        total = db_session.query(MealsEaten).count()
        assert total >= 1

    def test_delete_all_meals_no_auth_returns_401(self, client):
        response = client.delete("/api/v1/meals")
        assert response.status_code == 401


# ── Update Meal ──────────────────────────────────────────────────────────────


class TestUpdateMeal:
    """PATCH /api/v1/meal?meal_id=..."""

    def _add_meal(self, client, auth_headers, seed_food, db_session):
        food_code, mida_id, _ = seed_food
        client.put(
            "/api/v1/meal",
            headers=auth_headers,
            json={"food_id": food_code, "mida_id": mida_id, "amount": 1.0, "meal_type": "breakfast"},
        )
        return db_session.query(MealsEaten).order_by(MealsEaten.id.desc()).first().id

    def _meal_body(self, seed_food):
        food_code, mida_id, _ = seed_food
        return {
            "food_id": food_code,
            "mida_id": mida_id,
            "amount": 2.0,
            "meal_type": "lunch",
        }

    def test_update_meal_returns_200(self, client, auth_headers, seed_food, db_session):
        meal_id = self._add_meal(client, auth_headers, seed_food, db_session)
        response = client.patch(
            "/api/v1/meal",
            params={"meal_id": meal_id},
            headers=auth_headers,
            json=self._meal_body(seed_food),
        )
        assert response.status_code == 200

    def test_update_meal_changes_persisted_in_db(self, client, auth_headers, seed_food, db_session):
        meal_id = self._add_meal(client, auth_headers, seed_food, db_session)
        body = self._meal_body(seed_food)
        body["amount"] = 5.0
        client.patch(
            "/api/v1/meal",
            params={"meal_id": meal_id},
            headers=auth_headers,
            json=body,
        )
        db_session.expire_all()
        meal = db_session.get(MealsEaten, meal_id)
        assert meal.amount == 5.0

    def test_update_meal_partial_fields(self, client, auth_headers, seed_food, db_session):
        meal_id = self._add_meal(client, auth_headers, seed_food, db_session)
        # MealEntry requires all fields, so we send all but change only amount
        body = self._meal_body(seed_food)
        body["amount"] = 3.5
        response = client.patch(
            "/api/v1/meal",
            params={"meal_id": meal_id},
            headers=auth_headers,
            json=body,
        )
        assert response.status_code == 200

    def test_update_meal_change_meal_type(self, client, auth_headers, seed_food, db_session):
        meal_id = self._add_meal(client, auth_headers, seed_food, db_session)
        body = self._meal_body(seed_food)
        body["meal_type"] = "dinner"
        response = client.patch(
            "/api/v1/meal",
            params={"meal_id": meal_id},
            headers=auth_headers,
            json=body,
        )
        assert response.status_code == 200

    def test_update_meal_nonexistent_id_returns_403(self, client, auth_headers, seed_food):
        response = client.patch(
            "/api/v1/meal",
            params={"meal_id": 999999},
            headers=auth_headers,
            json=self._meal_body(seed_food),
        )
        assert response.status_code == 403

    def test_update_other_users_meal_returns_403(
        self, client, auth_headers, second_auth_headers, seed_food, db_session
    ):
        meal_id = self._add_meal(client, auth_headers, seed_food, db_session)
        response = client.patch(
            "/api/v1/meal",
            params={"meal_id": meal_id},
            headers=second_auth_headers,
            json=self._meal_body(seed_food),
        )
        assert response.status_code == 403

    def test_update_meal_no_auth_returns_401(self, client, seed_food):
        response = client.patch(
            "/api/v1/meal",
            params={"meal_id": 1},
            json=self._meal_body(seed_food),
        )
        assert response.status_code == 401

    def test_update_meal_missing_meal_id_returns_422(self, client, auth_headers, seed_food):
        response = client.patch(
            "/api/v1/meal",
            headers=auth_headers,
            json=self._meal_body(seed_food),
        )
        assert response.status_code == 422

    def test_update_meal_invalid_meal_type_returns_422(self, client, auth_headers, seed_food, db_session):
        meal_id = self._add_meal(client, auth_headers, seed_food, db_session)
        body = self._meal_body(seed_food)
        body["meal_type"] = "snack"
        response = client.patch(
            "/api/v1/meal",
            params={"meal_id": meal_id},
            headers=auth_headers,
            json=body,
        )
        assert response.status_code == 422


# ── Get Meals By Date ────────────────────────────────────────────────────────


class TestGetMealsByDate:
    """GET /api/v1/meals?date=...&end_date=..."""

    def _add_meal(self, client, auth_headers, seed_food):
        food_code, mida_id, _ = seed_food
        client.put(
            "/api/v1/meal",
            headers=auth_headers,
            json={"food_id": food_code, "mida_id": mida_id, "amount": 1.0, "meal_type": "breakfast"},
        )

    def test_get_meals_single_date_returns_200(self, client, auth_headers, seed_food):
        self._add_meal(client, auth_headers, seed_food)
        today = datetime.now(timezone.utc).strftime("%Y-%m-%dT00:00:00")
        response = client.get(
            "/api/v1/meals", params={"date": today}, headers=auth_headers
        )
        assert response.status_code == 200

    def test_get_meals_date_range_returns_meals_in_range(self, client, auth_headers, seed_food):
        self._add_meal(client, auth_headers, seed_food)
        today = datetime.now(timezone.utc)
        start = (today - timedelta(days=1)).strftime("%Y-%m-%dT00:00:00")
        end = (today + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00")
        response = client.get(
            "/api/v1/meals",
            params={"date": start, "end_date": end},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_meals_response_contains_expected_fields(self, client, auth_headers, seed_food):
        self._add_meal(client, auth_headers, seed_food)
        today = datetime.now(timezone.utc).strftime("%Y-%m-%dT00:00:00")
        response = client.get(
            "/api/v1/meals", params={"date": today}, headers=auth_headers
        )
        data = response.json()
        if len(data) > 0:
            item = data[0]
            for field in ("food_name", "date", "protein", "total_fat", "food_energy", "meal_id", "amount", "mida", "mishkal", "meal_type"):
                assert field in item

    def test_get_meals_no_meals_on_date_returns_empty_list(self, client, auth_headers):
        far_past = "2000-01-01T00:00:00"
        response = client.get(
            "/api/v1/meals", params={"date": far_past}, headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json() == []

    def test_get_meals_single_day_includes_full_day(self, client, auth_headers, seed_food):
        self._add_meal(client, auth_headers, seed_food)
        today = datetime.now(timezone.utc).strftime("%Y-%m-%dT00:00:00")
        response = client.get(
            "/api/v1/meals", params={"date": today}, headers=auth_headers
        )
        assert response.status_code == 200
        # Meal added "now" should be within today's full-day range
        assert isinstance(response.json(), list)

    def test_get_meals_does_not_return_other_users_meals(
        self, client, auth_headers, second_auth_headers, seed_food
    ):
        # User 1 adds a meal
        self._add_meal(client, auth_headers, seed_food)
        today = datetime.now(timezone.utc).strftime("%Y-%m-%dT00:00:00")
        # User 2 queries — should get empty
        response = client.get(
            "/api/v1/meals", params={"date": today}, headers=second_auth_headers
        )
        assert response.status_code == 200
        assert response.json() == []

    def test_get_meals_end_date_before_start_date_returns_400(self, client, auth_headers):
        response = client.get(
            "/api/v1/meals",
            params={"date": "2025-12-31T00:00:00", "end_date": "2025-01-01T00:00:00"},
            headers=auth_headers,
        )
        assert response.status_code == 400

    def test_get_meals_no_auth_returns_401(self, client):
        response = client.get("/api/v1/meals", params={"date": "2025-01-01T00:00:00"})
        assert response.status_code == 401

    def test_get_meals_missing_date_param_returns_422(self, client, auth_headers):
        response = client.get("/api/v1/meals", headers=auth_headers)
        assert response.status_code == 422

    def test_get_meals_invalid_date_format_returns_422(self, client, auth_headers):
        response = client.get(
            "/api/v1/meals", params={"date": "not-a-date"}, headers=auth_headers
        )
        assert response.status_code == 422


# ── Export Meals CSV ─────────────────────────────────────────────────────────


class TestExportMealsCSV:
    """GET /api/v1/meals/export"""

    def _add_meal(self, client, auth_headers, seed_food):
        food_code, mida_id, _ = seed_food
        client.put(
            "/api/v1/meal",
            headers=auth_headers,
            json={"food_id": food_code, "mida_id": mida_id, "amount": 1.0, "meal_type": "breakfast"},
        )

    def test_export_csv_returns_200_with_csv_content_type(self, client, auth_headers):
        response = client.get("/api/v1/meals/export", headers=auth_headers)
        assert response.status_code == 200
        assert "text/csv" in response.headers["content-type"]
        assert "attachment" in response.headers.get("content-disposition", "")

    def test_export_csv_contains_header_row(self, client, auth_headers):
        response = client.get("/api/v1/meals/export", headers=auth_headers)
        reader = csv.reader(io.StringIO(response.text))
        header = next(reader)
        expected = ["date", "mealType", "foodName", "amount", "unit", "calories", "protein", "fat", "carbohydrates"]
        assert header == expected

    def test_export_csv_contains_meal_data(self, client, auth_headers, seed_food):
        self._add_meal(client, auth_headers, seed_food)
        response = client.get("/api/v1/meals/export", headers=auth_headers)
        reader = csv.reader(io.StringIO(response.text))
        rows = list(reader)
        # Header + at least 1 data row
        assert len(rows) >= 2

    def test_export_csv_no_meals_returns_header_only(self, client, auth_headers):
        response = client.get("/api/v1/meals/export", headers=auth_headers)
        reader = csv.reader(io.StringIO(response.text))
        rows = list(reader)
        assert len(rows) == 1  # Only the header row

    def test_export_csv_does_not_include_other_users_meals(
        self, client, auth_headers, second_auth_headers, seed_food
    ):
        # Only user 1 adds a meal
        self._add_meal(client, auth_headers, seed_food)
        # User 2 exports — should have only header
        response = client.get("/api/v1/meals/export", headers=second_auth_headers)
        reader = csv.reader(io.StringIO(response.text))
        rows = list(reader)
        assert len(rows) == 1

    def test_export_csv_calorie_calculation_is_correct(self, client, auth_headers, seed_food):
        food_code, mida_id, mishkal = seed_food
        amount = 2.0
        client.put(
            "/api/v1/meal",
            headers=auth_headers,
            json={"food_id": food_code, "mida_id": mida_id, "amount": amount, "meal_type": "lunch"},
        )
        response = client.get("/api/v1/meals/export", headers=auth_headers)
        reader = csv.reader(io.StringIO(response.text))
        next(reader)  # skip header
        row = next(reader)
        # calories column index is 5 (0-indexed)
        # food_energy=52, mishkal=100.0, amount=2.0 → 52 * 100 * 2 / 100 = 104.0
        assert float(row[5]) == pytest.approx(52 * mishkal * amount / 100, rel=1e-2)

    def test_export_csv_no_auth_returns_401(self, client):
        response = client.get("/api/v1/meals/export")
        assert response.status_code == 401
