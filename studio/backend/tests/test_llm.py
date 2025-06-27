"""Tests for LLM endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_llm_providers():
    """Test getting available LLM providers."""
    response = client.get("/api/llm/providers")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "providers" in data["data"]
    assert isinstance(data["data"]["providers"], list)


def test_llm_generate_demo():
    """Test demo LLM generation."""
    response = client.post(
        "/api/llm/generate-demo",
        json={
            "prompt": "Hello, how are you?",
            "model": "demo"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "response" in data["data"]
    assert data["data"]["model"] == "demo"


def test_llm_generate_demo_empty_prompt():
    """Test demo generation with empty prompt."""
    response = client.post(
        "/api/llm/generate-demo",
        json={
            "prompt": "",
            "model": "demo"
        }
    )
    assert response.status_code == 422  # Validation error


def test_llm_generate_without_auth():
    """Test real LLM generation without authentication."""
    response = client.post(
        "/api/llm/generate",
        json={
            "prompt": "Hello",
            "model": "gpt-3.5-turbo",
            "provider": "openai"
        }
    )
    assert response.status_code == 403  # Forbidden without auth


def test_embeddings_demo():
    """Test demo embeddings generation."""
    response = client.post(
        "/api/llm/embeddings-demo",
        json={
            "text": "This is a test text for embeddings",
            "model": "demo"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "embedding" in data["data"]
    assert isinstance(data["data"]["embedding"], list)