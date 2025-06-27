"""Tests for authentication endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_demo_signin():
    """Test demo mode sign in."""
    response = client.post(
        "/api/auth/demo/signin",
        json={"email": "test@example.com", "password": "any-password"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "test@example.com"


def test_demo_signin_invalid_email():
    """Test demo sign in with invalid email format."""
    response = client.post(
        "/api/auth/demo/signin",
        json={"email": "invalid-email", "password": "password"}
    )
    assert response.status_code == 422  # Validation error


def test_demo_signup():
    """Test demo mode sign up."""
    response = client.post(
        "/api/auth/demo/signup",
        json={
            "email": "newuser@example.com",
            "password": "password123",
            "name": "Test User"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["email"] == "newuser@example.com"


def test_protected_endpoint_without_auth():
    """Test accessing protected endpoint without authentication."""
    response = client.get("/api/auth/me")
    assert response.status_code == 403  # Forbidden without auth header


def test_protected_endpoint_with_invalid_token():
    """Test accessing protected endpoint with invalid token."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid-token"}
    )
    assert response.status_code == 401  # Unauthorized