def add(client, amount, type_, category, day):
    response = client.post(
        "/transactions",
        json={
            "amount": amount,
            "type": type_,
            "category": category,
            "transaction_date": day,
        },
    )
    assert response.status_code == 201


def spending(client, month):
    return client.get("/summary/categories", params={"month": month})


def test_empty_month_has_no_categories(client):
    response = spending(client, "2026-10")

    assert response.status_code == 200
    assert response.json() == {"month": "2026-10", "total": "0.00", "categories": []}


def test_adds_up_expenses_per_category_largest_first(client):
    add(client, 12.34, "expense", "food", "2026-10-02")
    add(client, 800, "expense", "housing", "2026-10-01")
    add(client, 0.66, "expense", "food", "2026-10-20")

    assert spending(client, "2026-10").json() == {
        "month": "2026-10",
        "total": "813.00",
        "categories": [
            {"category": "housing", "amount": "800.00"},
            {"category": "food", "amount": "13.00"},
        ],
    }


def test_income_is_not_spending(client):
    add(client, 2500, "income", "salary", "2026-10-01")
    add(client, 5, "expense", "food", "2026-10-01")

    body = spending(client, "2026-10").json()

    assert body["total"] == "5.00"
    assert body["categories"] == [{"category": "food", "amount": "5.00"}]


def test_only_counts_days_inside_the_month(client):
    add(client, 1, "expense", "food", "2026-09-30")  # previous month
    add(client, 2, "expense", "food", "2026-10-01")  # first day: counted
    add(client, 4, "expense", "food", "2026-10-31")  # last day: counted
    add(client, 8, "expense", "food", "2026-11-01")  # next month

    assert spending(client, "2026-10").json()["total"] == "6.00"


def test_december_ends_at_new_year(client):
    add(client, 3, "expense", "shopping", "2026-12-31")
    add(client, 7, "expense", "shopping", "2027-01-01")

    assert spending(client, "2026-12").json()["total"] == "3.00"
    assert spending(client, "2027-01").json()["total"] == "7.00"


def test_rejects_a_badly_formatted_month(client):
    for bad in ["2026-13", "2026-1", "October", "2026-10-01"]:
        assert spending(client, bad).status_code == 422, bad


def test_month_is_required(client):
    assert client.get("/summary/categories").status_code == 422
