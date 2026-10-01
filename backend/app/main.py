from fastapi import FastAPI

app = FastAPI(title="Finance Manager API")


@app.get("/health")
def health_check():
    """Report that the API is running."""
    return {"status": "ok"}
