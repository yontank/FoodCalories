"""Integration tests for User Profile endpoints (user_profile_api.py)."""

import pytest
from datetime import datetime, timezone, timedelta

from db.schemas.weight_history import WeightHistory
from db.schemas.user_profile import UserProfile
from db.schemas.user_nutrition_profile import NutritionProfile


# ── Weight Entry ─────────────────────────────────────────────────────────────


class TestWeightEntry:
    """PUT /api/v1/weight and GET /api/v1/weight"""

    # --- PUT Normal ---

    def test_add_weight_entry_returns_201(self, client, auth_headers):
        response = client.put(
            "/api/v1/weight", params={"weight": 70.5}, headers=auth_headers
        )
        assert response.status_code == 201

    def test_add_weight_entry_persists_in_db(self, client, auth_headers, db_session, registered_user):
        client.put("/api/v1/weight", params={"weight": 70.5}, headers=auth_headers)
        from db.schemas.user import User

        user = db_session.query(User).filter(User.username == registered_user[0]).first()
        entry = (
            db_session.query(WeightHistory)
            .filter(WeightHistory.user_id == user.id)
            .first()
        )
        assert entry is not None
        assert entry.weight == pytest.approx(70.5)

    # --- GET Normal ---

    def test_get_weight_history_returns_entries_in_date_range(self, client, auth_headers):
        client.put("/api/v1/weight", params={"weight": 70.0}, headers=auth_headers)
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=1)).isoformat()
        end = (now + timedelta(days=1)).isoformat()
        response = client.get(
            "/api/v1/weight",
            params={"start_date": start, "end_date": end},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert len(response.json()) >= 1

    def test_get_weight_history_ordered_by_date(self, client, auth_headers):
        client.put("/api/v1/weight", params={"weight": 70.0}, headers=auth_headers)
        client.put("/api/v1/weight", params={"weight": 71.0}, headers=auth_headers)
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=1)).isoformat()
        end = (now + timedelta(days=1)).isoformat()
        response = client.get(
            "/api/v1/weight",
            params={"start_date": start, "end_date": end},
            headers=auth_headers,
        )
        data = response.json()
        if len(data) >= 2:
            assert data[0]["created_at"] <= data[1]["created_at"]

    def test_get_weight_history_response_contains_weight_and_timestamp(self, client, auth_headers):
        client.put("/api/v1/weight", params={"weight": 65.0}, headers=auth_headers)
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=1)).isoformat()
        end = (now + timedelta(days=1)).isoformat()
        response = client.get(
            "/api/v1/weight",
            params={"start_date": start, "end_date": end},
            headers=auth_headers,
        )
        data = response.json()
        assert len(data) >= 1
        assert "weight" in data[0]
        assert "created_at" in data[0]

    # --- Edge ---

    def test_add_weight_fractional_value(self, client, auth_headers):
        response = client.put(
            "/api/v1/weight", params={"weight": 65.3}, headers=auth_headers
        )
        assert response.status_code == 201

    def test_add_weight_very_small_positive_value(self, client, auth_headers):
        response = client.put(
            "/api/v1/weight", params={"weight": 0.1}, headers=auth_headers
        )
        assert response.status_code == 201

    def test_get_weight_history_no_entries_returns_empty_list(self, client, auth_headers):
        far_past_start = "2000-01-01T00:00:00+00:00"
        far_past_end = "2000-01-02T00:00:00+00:00"
        response = client.get(
            "/api/v1/weight",
            params={"start_date": far_past_start, "end_date": far_past_end},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json() == []

    def test_get_weight_history_does_not_return_other_users_entries(
        self, client, auth_headers, second_auth_headers
    ):
        # User 1 adds weight
        client.put("/api/v1/weight", params={"weight": 80.0}, headers=auth_headers)
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=1)).isoformat()
        end = (now + timedelta(days=1)).isoformat()
        # User 2 queries
        response = client.get(
            "/api/v1/weight",
            params={"start_date": start, "end_date": end},
            headers=second_auth_headers,
        )
        assert response.status_code == 200
        assert response.json() == []

    def test_get_weight_exact_boundary_dates_included(self, client, auth_headers):
        client.put("/api/v1/weight", params={"weight": 75.0}, headers=auth_headers)
        now = datetime.now(timezone.utc)
        # Use a tight window that still contains "now"
        start = (now - timedelta(seconds=10)).isoformat()
        end = (now + timedelta(seconds=10)).isoformat()
        response = client.get(
            "/api/v1/weight",
            params={"start_date": start, "end_date": end},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert len(response.json()) >= 1

    # --- Error ---

    def test_add_weight_zero_returns_422(self, client, auth_headers):
        response = client.put(
            "/api/v1/weight", params={"weight": 0}, headers=auth_headers
        )
        assert response.status_code == 422

    def test_add_weight_negative_returns_422(self, client, auth_headers):
        response = client.put(
            "/api/v1/weight", params={"weight": -5}, headers=auth_headers
        )
        assert response.status_code == 422

    def test_add_weight_missing_param_returns_422(self, client, auth_headers):
        response = client.put("/api/v1/weight", headers=auth_headers)
        assert response.status_code == 422

    def test_add_weight_no_auth_returns_401(self, client):
        response = client.put("/api/v1/weight", params={"weight": 70})
        assert response.status_code == 401

    def test_get_weight_missing_start_date_returns_422(self, client, auth_headers):
        response = client.get(
            "/api/v1/weight",
            params={"end_date": "2025-12-31T00:00:00+00:00"},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_get_weight_missing_end_date_returns_422(self, client, auth_headers):
        response = client.get(
            "/api/v1/weight",
            params={"start_date": "2025-01-01T00:00:00+00:00"},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_get_weight_no_auth_returns_401(self, client):
        response = client.get(
            "/api/v1/weight",
            params={
                "start_date": "2025-01-01T00:00:00+00:00",
                "end_date": "2025-12-31T00:00:00+00:00",
            },
        )
        assert response.status_code == 401


# ── Personal Profile ─────────────────────────────────────────────────────────


VALID_PROFILE = {
    "height": 175,
    "age": 25,
    "activity_factor": 1.5,
    "gender": "male",
}


class TestPersonalProfile:
    """GET /api/v1/profile and PATCH /api/v1/profile"""

    # --- GET Normal ---

    def test_get_profile_returns_200_with_profile_data(self, client, auth_headers):
        client.patch("/api/v1/profile", headers=auth_headers, json=VALID_PROFILE)
        response = client.get("/api/v1/profile", headers=auth_headers)
        assert response.status_code == 200

    def test_get_profile_contains_expected_fields(self, client, auth_headers):
        client.patch("/api/v1/profile", headers=auth_headers, json=VALID_PROFILE)
        response = client.get("/api/v1/profile", headers=auth_headers)
        data = response.json()
        for field in ("height", "age", "activity_factor", "gender"):
            assert field in data

    # --- PATCH Normal ---

    def test_save_profile_creates_new_profile_returns_201(self, client, auth_headers):
        response = client.patch(
            "/api/v1/profile", headers=auth_headers, json=VALID_PROFILE
        )
        assert response.status_code == 201

    def test_save_profile_updates_existing_profile(self, client, auth_headers):
        client.patch("/api/v1/profile", headers=auth_headers, json=VALID_PROFILE)
        updated = {**VALID_PROFILE, "height": 180, "age": 30}
        client.patch("/api/v1/profile", headers=auth_headers, json=updated)
        response = client.get("/api/v1/profile", headers=auth_headers)
        data = response.json()
        assert data["height"] == 180
        assert data["age"] == 30

    def test_save_profile_generates_display_name_on_first_create(
        self, client, auth_headers, db_session, registered_user
    ):
        client.patch("/api/v1/profile", headers=auth_headers, json=VALID_PROFILE)
        from db.schemas.user import User

        user = db_session.query(User).filter(User.username == registered_user[0]).first()
        profile = (
            db_session.query(UserProfile)
            .filter(UserProfile.user_id == user.id)
            .first()
        )
        assert profile is not None
        assert profile.name_display is not None
        assert len(profile.name_display) > 0

    # --- Edge ---

    def test_save_profile_minimum_valid_values(self, client, auth_headers):
        body = {"height": 1, "age": 0, "activity_factor": 0.01, "gender": "male"}
        response = client.patch("/api/v1/profile", headers=auth_headers, json=body)
        assert response.status_code == 201

    def test_save_profile_male_gender(self, client, auth_headers):
        body = {**VALID_PROFILE, "gender": "male"}
        response = client.patch("/api/v1/profile", headers=auth_headers, json=body)
        assert response.status_code == 201
        data = client.get("/api/v1/profile", headers=auth_headers).json()
        assert data["gender"] == "male"

    def test_save_profile_female_gender(self, client, auth_headers):
        body = {**VALID_PROFILE, "gender": "female"}
        response = client.patch("/api/v1/profile", headers=auth_headers, json=body)
        assert response.status_code == 201
        data = client.get("/api/v1/profile", headers=auth_headers).json()
        assert data["gender"] == "female"

    def test_get_profile_when_none_exists_returns_404(self, client, auth_headers):
        response = client.get("/api/v1/profile", headers=auth_headers)
        assert response.status_code == 404

    # --- Error ---

    def test_save_profile_height_zero_returns_422(self, client, auth_headers):
        body = {**VALID_PROFILE, "height": 0}
        response = client.patch("/api/v1/profile", headers=auth_headers, json=body)
        assert response.status_code == 422

    def test_save_profile_negative_age_returns_422(self, client, auth_headers):
        body = {**VALID_PROFILE, "age": -1}
        response = client.patch("/api/v1/profile", headers=auth_headers, json=body)
        assert response.status_code == 422

    def test_save_profile_zero_activity_factor_returns_422(self, client, auth_headers):
        body = {**VALID_PROFILE, "activity_factor": 0}
        response = client.patch("/api/v1/profile", headers=auth_headers, json=body)
        assert response.status_code == 422

    def test_save_profile_invalid_gender_returns_422(self, client, auth_headers):
        body = {**VALID_PROFILE, "gender": "other"}
        response = client.patch("/api/v1/profile", headers=auth_headers, json=body)
        assert response.status_code == 422

    def test_save_profile_missing_fields_returns_422(self, client, auth_headers):
        response = client.patch("/api/v1/profile", headers=auth_headers, json={})
        assert response.status_code == 422

    def test_save_profile_no_auth_returns_401(self, client):
        response = client.patch("/api/v1/profile", json=VALID_PROFILE)
        assert response.status_code == 401

    def test_get_profile_no_auth_returns_401(self, client):
        response = client.get("/api/v1/profile")
        assert response.status_code == 401


# ── Nutrition Profile ────────────────────────────────────────────────────────


VALID_NUTRITION = {"protein": 150, "carbohydrates": 250, "fat": 70}


class TestNutritionProfile:
    """GET /api/v1/profile/nutrition and PATCH /api/v1/profile/nutrition"""

    # --- GET Normal ---

    def test_get_nutrition_returns_200_with_values(self, client, auth_headers):
        client.patch(
            "/api/v1/profile/nutrition", headers=auth_headers, json=VALID_NUTRITION
        )
        response = client.get("/api/v1/profile/nutrition", headers=auth_headers)
        assert response.status_code == 200

    def test_get_nutrition_contains_protein_carbs_fat(self, client, auth_headers):
        client.patch(
            "/api/v1/profile/nutrition", headers=auth_headers, json=VALID_NUTRITION
        )
        response = client.get("/api/v1/profile/nutrition", headers=auth_headers)
        data = response.json()
        assert data["protein"] == 150
        assert data["carbohydrates"] == 250
        assert data["fat"] == 70

    # --- PATCH Normal ---

    def test_save_nutrition_creates_new_profile_returns_201(self, client, auth_headers):
        response = client.patch(
            "/api/v1/profile/nutrition", headers=auth_headers, json=VALID_NUTRITION
        )
        assert response.status_code == 201

    def test_save_nutrition_updates_existing_values(self, client, auth_headers):
        client.patch(
            "/api/v1/profile/nutrition", headers=auth_headers, json=VALID_NUTRITION
        )
        updated = {"protein": 200, "carbohydrates": 300, "fat": 80}
        client.patch(
            "/api/v1/profile/nutrition", headers=auth_headers, json=updated
        )
        data = client.get("/api/v1/profile/nutrition", headers=auth_headers).json()
        assert data["protein"] == 200
        assert data["carbohydrates"] == 300
        assert data["fat"] == 80

    # --- Edge ---

    def test_save_nutrition_zero_values(self, client, auth_headers):
        body = {"protein": 0, "carbohydrates": 0, "fat": 0}
        response = client.patch(
            "/api/v1/profile/nutrition", headers=auth_headers, json=body
        )
        assert response.status_code == 201

    def test_save_nutrition_large_values(self, client, auth_headers):
        body = {"protein": 9999, "carbohydrates": 9999, "fat": 9999}
        response = client.patch(
            "/api/v1/profile/nutrition", headers=auth_headers, json=body
        )
        assert response.status_code == 201

    def test_get_nutrition_when_none_exists_returns_404(self, client, auth_headers):
        response = client.get("/api/v1/profile/nutrition", headers=auth_headers)
        assert response.status_code == 404

    # --- Error ---

    def test_save_nutrition_negative_protein_returns_422(self, client, auth_headers):
        body = {**VALID_NUTRITION, "protein": -1}
        response = client.patch(
            "/api/v1/profile/nutrition", headers=auth_headers, json=body
        )
        assert response.status_code == 422

    def test_save_nutrition_negative_carbs_returns_422(self, client, auth_headers):
        body = {**VALID_NUTRITION, "carbohydrates": -1}
        response = client.patch(
            "/api/v1/profile/nutrition", headers=auth_headers, json=body
        )
        assert response.status_code == 422

    def test_save_nutrition_negative_fat_returns_422(self, client, auth_headers):
        body = {**VALID_NUTRITION, "fat": -1}
        response = client.patch(
            "/api/v1/profile/nutrition", headers=auth_headers, json=body
        )
        assert response.status_code == 422

    def test_save_nutrition_missing_fields_returns_422(self, client, auth_headers):
        response = client.patch(
            "/api/v1/profile/nutrition", headers=auth_headers, json={}
        )
        assert response.status_code == 422

    def test_save_nutrition_non_integer_values_returns_422(self, client, auth_headers):
        body = {"protein": 10.5, "carbohydrates": 20.5, "fat": 5.5}
        response = client.patch(
            "/api/v1/profile/nutrition", headers=auth_headers, json=body
        )
        assert response.status_code == 422

    def test_save_nutrition_no_auth_returns_401(self, client):
        response = client.patch("/api/v1/profile/nutrition", json=VALID_NUTRITION)
        assert response.status_code == 401

    def test_get_nutrition_no_auth_returns_401(self, client):
        response = client.get("/api/v1/profile/nutrition")
        assert response.status_code == 401
