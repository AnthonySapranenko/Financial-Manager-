def add_expense(client, amount, category, day="2026-10-05"):
    response = client.post(
        "/transactions",
        json={
            "amount": amount,
            "type": "expense",
            "category": category,
            "transaction_date": day,
        },
    )
    assert response.status_code == 201


def set_budget(client, category, amount):
    return client.put(f"/budgets/{category}", json={"amount": amount})


def budgets(client, month="2026-10"):
    """The GET /budgets list as a dict: {category: status}."""
    response = client.get("/budgets", params={"month": month})
    assert response.status_code == 200
    return {row["category"]: row for row in response.json()}


def test_lists_every_expense_category_without_budgets(client):
    rows = budgets(client)

    assert list(rows) == [
        "food",
        "housing",
        "transportation",
        "utilities",
        "entertainment",
        "health",
        "shopping",
        "other",
    ]  # no salary: it's income
    assert rows["food"] == {
        "category": "food",
        "budget": None,
        "spent": "0.00",
        "remaining": None,
    }


def test_setting_a_budget_returns_it(client):
    response = set_budget(client, "food", 400)

    assert response.status_code == 200
    assert response.json() == {"category": "food", "amount": "400.00"}
    assert budgets(client)["food"]["budget"] == "400.00"


def test_setting_again_changes_the_budget(client):
    set_budget(client, "food", 400)
    set_budget(client, "food", 350.50)

    assert budgets(client)["food"]["budget"] == "350.50"


def test_remaining_is_budget_minus_this_months_spending(client):
    set_budget(client, "food", 400)
    add_expense(client, 312.40, "food")
    add_expense(client, 99, "food", day="2026-09-30")  # last month: not counted

    food = budgets(client)["food"]
    assert food["spent"] == "312.40"
    assert food["remaining"] == "87.60"


def test_remaining_is_negative_when_over_budget(client):
    set_budget(client, "housing", 1100)
    add_expense(client, 1200, "housing")

    assert budgets(client)["housing"]["remaining"] == "-100.00"


def test_category_without_budget_still_shows_spending(client):
    add_expense(client, 45, "health")

    health = budgets(client)["health"]
    assert health["spent"] == "45.00"
    assert health["budget"] is None
    assert health["remaining"] is None


def test_delete_removes_the_budget(client):
    set_budget(client, "food", 400)

    assert client.delete("/budgets/food").status_code == 204
    assert budgets(client)["food"]["budget"] is None
    # Deleting again is harmless.
    assert client.delete("/budgets/food").status_code == 204


def test_rejects_bad_budgets(client):
    assert set_budget(client, "food", 0).status_code == 422
    assert set_budget(client, "food", 12.345).status_code == 422
    assert set_budget(client, "salary", 100).status_code == 422
    assert set_budget(client, "pets", 100).status_code == 422
    assert client.get("/budgets").status_code == 422  # month is required
