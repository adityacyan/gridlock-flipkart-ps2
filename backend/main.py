from fastapi import FastAPI
app = FastAPI(title="ASTRAM Gridlock API")
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "astram-gridlock-api"}
