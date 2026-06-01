
def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "online"
    assert "version" in data


    