import csv
import random
from typing import List
from fastapi import FastAPI, Body, status, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware import Middleware
from fastapi.websockets import WebSocketDisconnect
from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorCollection,
)
from pydantic import BaseModel
from datetime import datetime, date, time
from config import LLMS_CSV_FILE_PATH, ALLOWED_ORIGINS_CORS


class LLM(BaseModel):
    company: str
    category: str
    release_date: date
    model_name: str
    num_million_parameters: int


app = FastAPI(
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=ALLOWED_ORIGINS_CORS,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    ]
)
llms_collection: AsyncIOMotorCollection = AsyncIOMotorClient(
    "mongodb://root:example@mongodb:27017"
)["plino"]["llms"]


ws_clients: List[WebSocket] = []  # WebSocket clients
"""WebSockets are used to notify clients about the insertion of a new LLM in the DB."""


@app.websocket_route("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    ws_clients.append(websocket)
    try:
        while True:
            _ = await websocket.receive_text()
            # Keep the connection alive
    except WebSocketDisconnect:
        ws_clients.remove(websocket)


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.post(
    "/llm",
    status_code=status.HTTP_201_CREATED,
)
async def create_llm(
    llm: LLM | None = Body(None),
) -> None:
    """
    If the request body contains info about a particular LLM, add it to the MongoDB collection.
    Otherwise, read a random LLM from the CSV file and insert it into the.DB.
    """
    if not llm:
        # The user provided no request body, so we create one from a random row
        # from the LLMs CSV file
        with open(LLMS_CSV_FILE_PATH, mode="r") as file:
            reader = csv.DictReader(file)
            llms = list(reader)
            if not llms:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="No LLMs in CSV file",
                )
            chosen_llm = random.choice(llms)
            llm = LLM(
                company=chosen_llm["company"],
                model_name=chosen_llm["model_name"],
                num_million_parameters=int(chosen_llm["num_million_parameters"]),
                release_date=date.fromisoformat(chosen_llm["release_date"]),
                category=chosen_llm["category"],
            )

    existing_llm = await llms_collection.find_one(
        {"company": llm.company, "model_name": llm.model_name}
    )
    if existing_llm:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="LLM already present in DB"
        )
    # MongoDB cannot store dates without times, so we set the time at midnight for the release date
    llm_dict = {
        **llm.dict(),
        "release_date": datetime.combine(llm.release_date, time.min),
    }
    await llms_collection.insert_one(llm_dict)

    # Notify all connected clients about the new LLM
    llm_sent_info = {
        **llm_dict,
        "release_date": llm_dict.get(
            "release_date"
        ).isoformat(),  # Format to be able to JSON-encode the date
    }
    del llm_sent_info["_id"]  # We do not want to send this information
    for client in ws_clients:
        await client.send_json(llm_sent_info)


class GetLLMsResponseBody(BaseModel):
    llms: List[LLM]


@app.get(
    "/llms",
    status_code=status.HTTP_200_OK,
    response_model=GetLLMsResponseBody,
)
async def get_llms() -> GetLLMsResponseBody:
    """Retrieve LLMs from the database."""
    llms = []
    async for llm in llms_collection.find():
        llms.append(LLM(**llm))
    return GetLLMsResponseBody(llms=llms)
