class TestLoginAPI_DEFAULT:
    def test_index_page(self, client):
        response = client.get("/api/v1")
        assert response.status_code == 200

    def test_health_endpoint(self, client):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert "timestamp" in response.json()


class TestLoginAPI_LOGIN:
    def test_login_with_valid_credentials(self, client):
        response = client.post(
            "/api/v1/login",
            json={"username": "testuser", "password": "testpassword"},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"

    def test_login_with_invalid_credentials(self, client):
        response = client.post(
            "/api/v1/login",
            json={"username": "invaliduser", "password": "invalidpassword"},
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect username or password"
