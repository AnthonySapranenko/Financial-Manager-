def add(client, amount, type_, category="other"):
    response = client.post(
        "/transactions",
        json={
            "amount": amount,
            "type": type_,
            "category": category,
            "transaction_date": "2026-10-01",
        },
    )
    assert response.status_code == 201


def test_summary_is_zero_with_no_transactions(client):
    response = client.get("/summary")

    assert response.status_code == 200
    assert response.json() == {
        "total_income": "0.00",
        "total_expenses": "0.00",
        "balance": "0.00",
    }


def test_summary_adds_income_and_subtracts_expenses(client):
    add(client, 2500, "income", "salary")
    add(client, 100.50, "income")
    add(client, 12.34, "expense", "food")
    add(client, 800, "expense", "housing")

    assert client.get("/summary").json() == {
        "total_income": "2600.50",
        "total_expenses": "812.34",
        "balance": "1788.16",
    }


def test_summary_balance_can_be_negative(client):
    add(client, 10, "income")
    add(client, 25.75, "expense")

    assert client.get("/summary").json()["balance"] == "-15.75"


def test_summary_has_no_floating_point_errors(client):
    # With floats, 0.10 + 0.20 would be 0.30000000000000004.
    add(client, 0.10, "income")
    add(client, 0.20, "income")

    assert client.get("/summary").json()["total_income"] == "0.30"


def add_on(client, amount, type_, day):
    response = client.post(
        "/transactions",
        json={
            "amount": amount,
            "type": type_,
            "category": "other",
            "transaction_date": day,
        },
    )
    assert response.status_code == 201


def test_summary_for_one_month(client):
    add_on(client, 1000, "income", "2026-10-01")
    add_on(client, 40, "expense", "2026-10-31")
    add_on(client, 500, "income", "2026-09-30")  # other months: not counted
    add_on(client, 7, "expense", "2026-11-01")

    assert client.get("/summary", params={"month": "2026-10"}).json() == {
        "total_income": "1000.00",
        "total_expenses": "40.00",
        "balance": "960.00",
    }
    # Without a month, it's still all time.
    assert client.get("/summary").json()["balance"] == "1453.00"


def test_summary_rejects_a_bad_month(client):
    assert client.get("/summary", params={"month": "2026-13"}).status_code == 422
